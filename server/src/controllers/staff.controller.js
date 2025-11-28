// server/src/controllers/staff.controller.js
import pool from "../db.js";
import { STATUS, nextStatusForStaffAction } from "../utils/orderStatus.js";

/**
 * Map VN -> EN để luôn đồng bộ 2 cột status/status_vn
 */
const mapStatusENFromVN = (vn) => {
  switch (vn) {
    case STATUS.PENDING:
      return "pending";
    case STATUS.ACCEPTED:
      return "confirmed";
    case STATUS.MOVING:
      return "moving";
    case STATUS.CARING:
      return "caring";
    case STATUS.DONE:
      return "completed";
    case STATUS.CANCELLED:
      return "cancelled";
    default:
      return "pending";
  }
};

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
        o.id, o.user_id,
        o.scheduled_date, o.address, o.total_price, o.status_vn, o.note, o.phone, o.voucher_code,
        COALESCE(o.customer_name, u.full_name) AS customer_name,
        STRING_AGG(s.name, ', ') AS services,
        p.name AS plant_name
      FROM orders o
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN services s ON s.id=oi.service_id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      LEFT JOIN assignments a ON a.order_id=o.id
      WHERE a.id IS NULL
        AND o.status_vn=$1
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
        o.id, o.user_id,
        o.scheduled_date, o.address, o.total_price, o.status_vn, o.status, o.note, o.phone, o.voucher_code,
        COALESCE(o.customer_name, u.full_name) AS customer_name,
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

// detail task
export const getTaskDetail = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const staffId = await getStaffIdByUser(req.user.id);
    if (!staffId)
      return res.status(404).json({ message: "Staff profile not found" });

    const q = `
      SELECT
        o.id, o.user_id,
        o.scheduled_date, o.address, o.total_price, o.status_vn, o.status,
        o.note, o.phone, o.voucher_code,
        COALESCE(o.customer_name, u.full_name) AS customer_name,
        STRING_AGG(s.name, ', ') AS services,
        p.name AS plant_name
      FROM assignments a
      JOIN orders o ON o.id=a.order_id
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN services s ON s.id=oi.service_id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      WHERE a.staff_id=$1 AND o.id=$2
      GROUP BY o.id, u.full_name, p.name
    `;
    const r = await pool.query(q, [staffId, orderId]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Not found" });

    res.json(r.rows[0]);
  } catch (err) {
    console.error("getTaskDetail", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * update status + history + notifications
 */
const changeOrderStatus = async (client, order, userId, action, note = "") => {
  const nextVN = nextStatusForStaffAction(order.status_vn, action);
  if (!nextVN) throw new Error("Invalid status transition");

  const nextEN = mapStatusENFromVN(nextVN);

  await client.query(
    "UPDATE orders SET status_vn=$1, status=$2, updated_at=NOW() WHERE id=$3",
    [nextVN, nextEN, order.id]
  );

  await client.query(
    `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
     VALUES ($1,$2,$3,$4,$5)`,
    [order.id, order.status_vn, nextVN, userId, note || action]
  );

  // notify customer realtime
  await client.query(
    `INSERT INTO notifications (user_id, title, message, is_read, created_at)
     VALUES ($1,$2,$3,false,NOW())`,
    [
      order.user_id,
      "Cập nhật đơn hàng",
      `Đơn #${order.id} chuyển trạng thái: ${nextVN}`,
    ]
  );

  // notify admin realtime
  await client.query(
    `INSERT INTO notifications (user_id, title, message, is_read, created_at)
     SELECT u.id, 'Cập nhật đơn hàng', $1, false, NOW()
     FROM users u WHERE u.role_id=1`,
    [`Đơn #${order.id} chuyển trạng thái: ${nextVN}`]
  );

  return { nextVN, nextEN };
};

// accept -> tạo assignment + task
export const acceptOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const userId = req.user.id;
  const staffId = await getStaffIdByUser(userId);

  if (!staffId) {
    return res.status(404).json({ message: "Staff profile not found" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const oRes = await client.query(
      "SELECT * FROM orders WHERE id=$1 FOR UPDATE",
      [orderId]
    );
    if (oRes.rowCount === 0) throw new Error("Order not found");
    const order = oRes.rows[0];

    if (order.status_vn !== STATUS.PENDING) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Không thể nhận đơn khi trạng thái = ${order.status_vn}`,
      });
    }

    const chk = await client.query(
      "SELECT 1 FROM assignments WHERE order_id=$1 LIMIT 1",
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

    await client.query(
      `INSERT INTO tasks (assignment_id, title, description, status)
       VALUES ($1,$2,$3,'pending')`,
      [
        aRes.rows[0].id,
        `Chăm sóc đơn #${orderId}`,
        order.note || "",
      ]
    );

    const { nextVN, nextEN } = await changeOrderStatus(
      client,
      order,
      userId,
      "accept"
    );

    await client.query("COMMIT");
    res.json({ message: "Accepted", status_vn: nextVN, status: nextEN });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("acceptOrder", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * ✅ NEW: staff hủy đơn
 * - Nếu đơn chưa ai nhận (PENDING, chưa có assignment) => staff được hủy
 * - Nếu đơn đã assign => chỉ staff đang giữ assignment mới được hủy
 */
export const cancelOrderByStaff = async (req, res) => {
  const orderId = Number(req.params.id);
  const staffUserId = req.user.id;
  const staffId = await getStaffIdByUser(staffUserId);
  if (!staffId)
    return res.status(404).json({ message: "Staff profile not found" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const oRes = await client.query(
      "SELECT * FROM orders WHERE id=$1 FOR UPDATE",
      [orderId]
    );
    if (oRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }
    const order = oRes.rows[0];

    // kiểm tra assignment hiện tại (nếu có)
    const aRes = await client.query(
      "SELECT * FROM assignments WHERE order_id=$1 LIMIT 1",
      [orderId]
    );
    const assignment = aRes.rowCount ? aRes.rows[0] : null;

    // nếu có assignment mà không phải của staff này => forbidden
    if (assignment && assignment.staff_id !== staffId) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Bạn không có quyền hủy đơn của staff khác.",
      });
    }

    // chỉ cho hủy khi chưa hoàn tất
    if (order.status_vn === STATUS.DONE) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Đơn đã hoàn tất, không thể hủy.",
      });
    }

    // update trạng thái
    await client.query(
      "UPDATE orders SET status_vn=$1, status=$2, updated_at=NOW() WHERE id=$3",
      [STATUS.CANCELLED, "cancelled", orderId]
    );

    // update assignment/task nếu có
    if (assignment) {
      await client.query(
        "UPDATE assignments SET status='cancelled' WHERE id=$1",
        [assignment.id]
      );
      await client.query(
        "UPDATE tasks SET status='cancelled' WHERE assignment_id=$1",
        [assignment.id]
      );
    }

    // history
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
       VALUES ($1,$2,$3,$4,$5)`,
      [orderId, order.status_vn, STATUS.CANCELLED, staffUserId, "staff cancel"]
    );

    // notify customer + admin
    await client.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1,'Đơn bị hủy',$2,false,NOW())`,
      [order.user_id, `Đơn #${orderId} đã bị staff hủy.`]
    );

    await client.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       SELECT u.id, 'Đơn bị hủy', $1, false, NOW()
       FROM users u WHERE u.role_id=1`,
      [`Đơn #${orderId} đã bị staff hủy.`]
    );

    await client.query("COMMIT");
    res.json({ message: "Cancelled by staff" });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("cancelOrderByStaff", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const rejectOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  const reason = req.body.reason || "staff reject";
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       SELECT u.id, 'Staff từ chối', $1, false, NOW()
       FROM users u WHERE u.role_id=1`,
      [`Đơn #${orderId} bị staff từ chối. Lý do: ${reason}`]
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
  if (!staffId)
    return res.status(404).json({ message: "Staff profile not found" });

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

    const { nextVN, nextEN } = await changeOrderStatus(
      client,
      oRes.rows[0],
      staffUserId,
      "move"
    );

    await client.query("COMMIT");
    res.json({ message: "Moving", status_vn: nextVN, status: nextEN });
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
  if (!staffId)
    return res.status(404).json({ message: "Staff profile not found" });

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

    const { nextVN, nextEN } = await changeOrderStatus(
      client,
      oRes.rows[0],
      staffUserId,
      "care"
    );

    await client.query("COMMIT");
    res.json({ message: "Caring", status_vn: nextVN, status: nextEN });
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
  if (!staffId)
    return res.status(404).json({ message: "Staff profile not found" });

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
    const { nextVN, nextEN } = await changeOrderStatus(
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
      `UPDATE tasks 
       SET status='completed', completed_at=NOW() 
       WHERE assignment_id=(SELECT id FROM assignments WHERE order_id=$1)`,
      [orderId]
    );

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
    res.json({ message: "Completed", status_vn: nextVN, status: nextEN });
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
    if (!staffId)
      return res.status(404).json({ message: "Staff profile not found" });

    const r = await pool.query(
      `SELECT o.id, o.scheduled_date, o.address, o.phone, o.total_price, o.status_vn,
              COALESCE(o.customer_name, u.full_name) as customer_name
       FROM assignments a
       JOIN orders o ON o.id=a.order_id
       JOIN users u ON u.id=o.user_id
       WHERE a.staff_id=$1 
         AND (o.status_vn IN ($2,$3) OR o.status IN ('completed','cancelled'))
       ORDER BY o.scheduled_date DESC`,
      [staffId, STATUS.DONE, STATUS.CANCELLED]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("taskHistory", err);
    res.status(500).json({ error: err.message });
  }
};

export const incomeStats = async (req, res) => {
  try {
    const staffId = await getStaffIdByUser(req.user.id);
    if (!staffId)
      return res.status(404).json({ message: "Staff profile not found" });

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
