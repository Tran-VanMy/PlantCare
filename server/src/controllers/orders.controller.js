// server/src/controllers/orders.controller.js
import pool from "../db.js";
import { STATUS, canCustomerCancel } from "../utils/orderStatus.js";

/**
 * rule tạo voucher:
 * - user đặt lần 2,4,6,8,10... => tạo voucher mới, hạn 30 ngày
 * - % tăng theo mốc: 2->5%, 4->8%, 6->10%, 8->12%, 10->15%
 */
const milestoneDiscount = (milestone) => {
  if (milestone >= 10) return 15;
  if (milestone >= 8) return 12;
  if (milestone >= 6) return 10;
  if (milestone >= 4) return 8;
  return 5;
};

const createVoucherForUserIfNeeded = async (client, userId) => {
  const countRes = await client.query(
    "SELECT COUNT(*)::int AS cnt FROM orders WHERE user_id=$1",
    [userId]
  );
  const cnt = countRes.rows[0].cnt;
  if (cnt % 2 !== 0) return null; // chỉ mốc chẵn

  const milestone = cnt; // 2,4,6...
  const discount = milestoneDiscount(milestone);
  const code = `PC-${userId}-${milestone}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

  const vRes = await client.query(
    `INSERT INTO vouchers (code, discount_percent, expires_at)
     VALUES ($1,$2, NOW() + INTERVAL '30 days')
     RETURNING *`,
    [code, discount]
  );

  await client.query(
    `INSERT INTO user_vouchers (user_id, voucher_id, is_used)
     VALUES ($1,$2,false)`,
    [userId, vRes.rows[0].id]
  );

  return vRes.rows[0];
};

export const createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { services, scheduled_date, address, note, plant_id, voucher_code } = req.body;

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ message: "services is required and must be a non-empty array" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // kiểm tra voucher nếu có
    let voucher = null;
    if (voucher_code) {
      const vq = await client.query(
        `SELECT uv.id as uv_id, v.*
         FROM user_vouchers uv 
         JOIN vouchers v ON uv.voucher_id=v.id
         WHERE uv.user_id=$1 AND uv.is_used=false AND v.code=$2 AND v.expires_at > NOW()
         LIMIT 1`,
        [userId, voucher_code]
      );
      if (vq.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Voucher không hợp lệ hoặc đã hết hạn." });
      }
      voucher = vq.rows[0];
    }

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, scheduled_date, address, note, status, status_vn, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'pending',$5,NOW(),NOW())
       RETURNING *`,
      [userId, scheduled_date || null, address || null, note || null, STATUS.PENDING]
    );
    const order = orderRes.rows[0];

    let total = 0;
    for (const s of services) {
      const serviceId = s.service_id;
      const qty = Number(s.quantity || 1);
      const price = Number(s.price);
      if (!serviceId || isNaN(price)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Each service must have service_id and price" });
      }
      total += qty * price;
      await client.query(
        `INSERT INTO order_items (order_id, service_id, quantity, price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, serviceId, qty, price]
      );
    }

    // áp voucher
    if (voucher) {
      total = total * (1 - voucher.discount_percent / 100);
      await client.query(
        `UPDATE user_vouchers SET is_used=true, used_at=NOW() WHERE id=$1`,
        [voucher.uv_id]
      );
    }

    await client.query(
      `UPDATE orders SET total_price=$1 WHERE id=$2`,
      [total, order.id]
    );

    // gắn plant vào order nếu có
    if (plant_id) {
      await client.query(
        `INSERT INTO order_plants (order_id, plant_id) VALUES ($1,$2)`,
        [order.id, plant_id]
      );
    }

    // tạo payment luôn paid
    await client.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status, created_at)
       VALUES ($1,$2,'cash','paid',NOW())`,
      [order.id, total]
    );

    // log history
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
       VALUES ($1,null,$2,$3,'customer created')`,
      [order.id, STATUS.PENDING, userId]
    );

    // notifications cho admin và staff
    const staffUsers = await client.query(`SELECT user_id FROM staff WHERE availability=true`);
    for (const st of staffUsers.rows) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, is_read, created_at)
         VALUES ($1,$2,$3,false,NOW())`,
        [st.user_id, "Đơn mới", `Có đơn mới #${order.id} cần nhận.`]
      );
    }

    // tạo voucher mốc chẵn sau khi order
    const newVoucher = await createVoucherForUserIfNeeded(client, userId);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created and payment confirmed",
      order_id: order.id,
      total,
      voucher_awarded: newVoucher,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("createOrder error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const requester = req.user;

    if (requester.role !== 1 && requester.id !== customerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const q = `
      SELECT
        o.id,
        o.total_price AS total,
        o.status_vn AS status,
        o.scheduled_date AS date,
        o.address,
        o.note,
        STRING_AGG(s.name, ', ') AS service_name,
        p.name AS plant_name
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON s.id = oi.service_id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total_price, o.status_vn, o.scheduled_date, o.address, o.note, p.name
      ORDER BY o.scheduled_date DESC
      LIMIT 1000
    `;
    const r = await pool.query(q, [customerId]);

    res.json(
      r.rows.map((row) => ({
        id: row.id,
        service: row.service_name,
        plant: row.plant_name || "—",
        total: Number(row.total) || 0,
        date: row.date,
        address: row.address,
        note: row.note,
        status: row.status,
      }))
    );
  } catch (err) {
    console.error("getCustomerOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const cancelOrderByCustomer = async (req, res) => {
  const orderId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const oRes = await pool.query("SELECT * FROM orders WHERE id=$1", [orderId]);
    if (oRes.rowCount === 0) return res.status(404).json({ message: "Order not found" });

    const order = oRes.rows[0];
    if (order.user_id !== userId) return res.status(403).json({ message: "Forbidden" });

    if (!canCustomerCancel(order.status_vn)) {
      return res.status(400).json({ message: "Đơn đã có staff nhận, không thể hủy." });
    }

    await pool.query("UPDATE orders SET status_vn=$1, status='cancelled', updated_at=NOW() WHERE id=$2",
      [STATUS.CANCELLED, orderId]
    );

    await pool.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
       VALUES ($1,$2,$3,$4,'customer cancel')`,
      [orderId, order.status_vn, STATUS.CANCELLED, userId]
    );

    res.json({ message: "Cancelled" });
  } catch (err) {
    console.error("cancelOrderByCustomer error:", err);
    res.status(500).json({ error: err.message });
  }
};
