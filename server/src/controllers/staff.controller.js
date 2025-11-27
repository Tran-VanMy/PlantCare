// server/src/controllers/staff.controller.js
import pool from "../db.js";
import { STATUS, nextStatusForStaffAction } from "../utils/orderStatus.js";

const getStaffIdByUser = async (userId) => {
  const r = await pool.query(
    "SELECT id FROM staff WHERE user_id=$1 LIMIT 1",
    [userId]
  );
  if (r.rowCount === 0) return null;
  return r.rows[0].id;
};

// list order chưa có assignment
export const listAvailableOrders = async (req, res) => {
  try {
    const q = `
      SELECT
        o.id, o.scheduled_date, o.address, o.total_price, o.status_vn, o.note, o.phone, o.voucher_code,
        u.full_name AS customer_name,
        STRING_AGG(s.name, ', ') AS services,
        p.name AS plant_name
      FROM orders o
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN services s ON s.id=oi.service_id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      LEFT JOIN assignments a ON a.order_id=o.id
      WHERE a.id IS NULL AND o.status_vn=$1
      GROUP BY o.id, u.full_name, p.name
      ORDER BY o.scheduled_date ASC
    `;
    const r = await pool.query(q, [STATUS.PENDING]);
    res.json(r.rows);
  } catch (err) {
    console.error("listAvailableOrders", err);
    res.status(500).json({ error: err.message });
  }
};

// list task (đơn đã nhận)
export const listMyTasks = async (req, res) => {
  try {
    const staffId = await getStaffIdByUser(req.user.id);
    if (!staffId)
      return res.status(404).json({ message: "Staff profile not found" });

    const q = `
      SELECT
        o.id, o.scheduled_date, o.address, o.total_price, o.status_vn, o.status, o.note, o.phone, o.voucher_code,
        u.full_name AS customer_name,
        STRING_AGG(s.name, ', ') AS services,
        p.name AS plant_name,
        a.status AS assignment_status
      FROM assignments a
      JOIN orders o ON o.id=a.order_id
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN services s ON s.id=oi.service_id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      WHERE a.staff_id=$1
      GROUP BY o.id, u.full_name, p.name, a.status
      ORDER BY o.scheduled_date DESC
    `;
    const r = await pool.query(q, [staffId]);
    res.json(r.rows);
  } catch (err) {
    console.error("listMyTasks", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTaskDetail = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const staffId = await getStaffIdByUser(req.user.id);

    const q = `
      SELECT
        o.*, u.full_name AS customer_name,
        STRING_AGG(s.name, ', ') AS services,
        p.*
      FROM assignments a
      JOIN orders o ON o.id=a.order_id
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN services s ON s.id=oi.service_id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      WHERE a.staff_id=$1 AND o.id=$2
      GROUP BY o.id, u.full_name, p.id
    `;
    const r = await pool.query(q, [staffId, orderId]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Not found" });

    res.json(r.rows[0]);
  } catch (err) {
    console.error("getTaskDetail", err);
    res.status(500).json({ error: err.message });
  }
};

const changeOrderStatus = async (client, order, userId, action, note = "") => {
  const next = nextStatusForStaffAction(order.status_vn, action);
  if (!next) throw new Error("Invalid status transition");

  await client.query(
    "UPDATE orders SET status_vn=$1, updated_at=NOW() WHERE id=$2",
    [next, order.id]
  );

  await client.query(
    `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
     VALUES ($1,$2,$3,$4,$5)`,
    [order.id, order.status_vn, next, userId, note || action]
  );

  await client.query(
    `INSERT INTO notifications (user_id, title, message, is_read, created_at)
     VALUES ($1,$2,$3,false,NOW())`,
    [
      order.user_id,
      "Cập nhật đơn hàng",
      `Đơn #${order.id} chuyển trạng thái: ${next}`,
    ]
  );

  return next;
};

// accept -> tạo assignment + task
export const acceptOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const userId = req.user.id;
  const staffId = await getStaffIdByUser(userId);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const oRes = await client.query(
      "SELECT * FROM orders WHERE id=$1 FOR UPDATE",
      [orderId]
    );
    if (oRes.rowCount === 0) throw new Error("Order not found");
    const order = oRes.rows[0];

    // check chưa ai nhận
    const chk = await client.query(
      "SELECT * FROM assignments WHERE order_id=$1",
      [orderId]
    );
    if (chk.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Order already assigned" });
    }

    const aRes = await client.query(
      `INSERT INTO assignments (order_id, staff_id, assigned_at, status)
       VALUES ($1,$2,NOW(),'assigned') RETURNING *`,
      [orderId, staffId]
    );

    // tạo 1 task cho order
    await client.query(
      `INSERT INTO tasks (assignment_id, title, description, status)
       VALUES ($1,$2,$3,'pending')`,
      [aRes.rows[0].id, `Chăm sóc đơn #${orderId}`, order.note || ""]
    );

    const next = await changeOrderStatus(client, order, userId, "accept");

    await client.query("COMMIT");
    res.json({ message: "Accepted", status: next });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("acceptOrder", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// reject -> tạo notification cho admin để reassign
export const rejectOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const reason = req.body.reason || "staff reject";
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       SELECT u.id, 'Staff từ chối', $2, false, NOW()
       FROM users u WHERE u.role_id=1`,
      [orderId, `Đơn #${orderId} bị staff từ chối. Lý do: ${reason}`]
    );
    res.json({ message: "Reject request sent to admin" });
  } catch (err) {
    console.error("rejectOrder", err);
    res.status(500).json({ error: err.message });
  }
};

export const moveOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const staffUserId = req.user.id;
  const staffId = await getStaffIdByUser(staffUserId);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const oRes = await client.query(
      `SELECT o.* FROM orders o
       JOIN assignments a ON a.order_id=o.id
       WHERE o.id=$1 AND a.staff_id=$2 FOR UPDATE`,
      [orderId, staffId]
    );
    if (oRes.rowCount === 0) throw new Error("Forbidden");

    const next = await changeOrderStatus(
      client,
      oRes.rows[0],
      staffUserId,
      "move"
    );
    await client.query("COMMIT");
    res.json({ message: "Moving", status: next });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("moveOrder", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const startCareOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const staffUserId = req.user.id;
  const staffId = await getStaffIdByUser(staffUserId);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const oRes = await client.query(
      `SELECT o.* FROM orders o
       JOIN assignments a ON a.order_id=o.id
       WHERE o.id=$1 AND a.staff_id=$2 FOR UPDATE`,
      [orderId, staffId]
    );
    if (oRes.rowCount === 0) throw new Error("Forbidden");

    const next = await changeOrderStatus(
      client,
      oRes.rows[0],
      staffUserId,
      "care"
    );
    await client.query("COMMIT");
    res.json({ message: "Caring", status: next });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("startCareOrder", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const completeOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const staffUserId = req.user.id;
  const staffId = await getStaffIdByUser(staffUserId);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const oRes = await client.query(
      `SELECT o.* FROM orders o
       JOIN assignments a ON a.order_id=o.id
       WHERE o.id=$1 AND a.staff_id=$2 FOR UPDATE`,
      [orderId, staffId]
    );
    if (oRes.rowCount === 0) throw new Error("Forbidden");

    const order = oRes.rows[0];
    const next = await changeOrderStatus(
      client,
      order,
      staffUserId,
      "complete"
    );

    await client.query(
      "UPDATE assignments SET status='done' WHERE order_id=$1",
      [orderId]
    );
    await client.query(
      "UPDATE tasks SET status='completed', completed_at=NOW() WHERE assignment_id=(SELECT id FROM assignments WHERE order_id=$1)",
      [orderId]
    );

    // milestone bonus cho staff
    const doneCntRes = await client.query(
      `SELECT COUNT(*)::int AS cnt
       FROM assignments a JOIN orders o ON a.order_id=o.id
       WHERE a.staff_id=$1 AND o.status_vn=$2`,
      [staffId, STATUS.DONE]
    );
    const cnt = doneCntRes.rows[0].cnt;
    if (cnt % 2 === 0) {
      const bonus = Math.min(5 + cnt, 50);
      await client.query(
        `INSERT INTO staff_bonuses (staff_id, order_id, milestone, bonus_amount)
         VALUES ($1,$2,$3,$4)`,
        [staffId, orderId, cnt, bonus]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Completed", status: next });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("completeOrder", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const taskHistory = async (req, res) => {
  try {
    const staffId = await getStaffIdByUser(req.user.id);
    const r = await pool.query(
      `SELECT o.id, o.scheduled_date, o.address, o.phone, o.total_price, o.status_vn,
              u.full_name as customer_name
       FROM assignments a
       JOIN orders o ON o.id=a.order_id
       JOIN users u ON u.id=o.user_id
       WHERE a.staff_id=$1 AND o.status_vn IN ($2,$3)
       ORDER BY o.scheduled_date DESC`,
      [staffId, STATUS.DONE, STATUS.CANCELLED]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("taskHistory", err);
    res.status(500).json({ error: err.message });
  }
};

// thống kê thu nhập tuần/tháng + bonus
export const incomeStats = async (req, res) => {
  try {
    const staffId = await getStaffIdByUser(req.user.id);

    const incomeRes = await pool.query(
      `SELECT
         DATE_TRUNC('month', o.scheduled_date) AS month,
         SUM(o.total_price)::numeric(12,2) AS income
       FROM assignments a
       JOIN orders o ON o.id=a.order_id
       WHERE a.staff_id=$1 AND o.status_vn=$2
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      [staffId, STATUS.DONE]
    );

    const bonusRes = await pool.query(
      `SELECT milestone, bonus_amount, created_at, order_id
       FROM staff_bonuses WHERE staff_id=$1
       ORDER BY created_at DESC LIMIT 50`,
      [staffId]
    );

    res.json({
      income_by_month: incomeRes.rows,
      bonuses: bonusRes.rows,
    });
  } catch (err) {
    console.error("incomeStats", err);
    res.status(500).json({ error: err.message });
  }
};
