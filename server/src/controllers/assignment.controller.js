// server/src/controllers/assignment.controller.js
import pool from "../db.js";
import { STATUS } from "../utils/orderStatus.js";

/**
 * Assign staff to order (admin)
 * body: { order_id, staff_id }
 */
export const assignStaffToOrder = async (req, res) => {
  const { order_id, staff_id } = req.body;
  if (!order_id || !staff_id)
    return res.status(400).json({ message: "order_id and staff_id are required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [order_id]);
    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }
    const order = orderRes.rows[0];

    const staffRes = await client.query("SELECT * FROM staff WHERE id=$1", [staff_id]);
    if (staffRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Staff not found" });
    }

    // prevent duplicates
    const chk = await client.query("SELECT id FROM assignments WHERE order_id=$1", [order_id]);
    if (chk.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Order already assigned" });
    }

    const insertRes = await client.query(
      `INSERT INTO assignments (order_id, staff_id, assigned_at, status)
       VALUES ($1,$2,NOW(),'assigned')
       RETURNING id, order_id, staff_id, assigned_at, status`,
      [order_id, staff_id]
    );

    // ✅ req19: đồng bộ status + status_vn
    await client.query(
      "UPDATE orders SET status='assigned', status_vn=$1, updated_at=NOW() WHERE id=$2",
      [STATUS.ACCEPTED, order_id]
    );

    // log history
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
       VALUES ($1,$2,$3,$4,'admin assigned staff')`,
      [order_id, order.status_vn, STATUS.ACCEPTED, req.user.id]
    );

    // notify customer
    await client.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1,'Đơn hàng đã được nhận',$2,false,NOW())`,
      [order.user_id, `Đơn #${order_id} đã được gán cho nhân viên.`]
    );

    // notify staff được gán
    const staffUserId = staffRes.rows[0].user_id;
    await client.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1,'Bạn có đơn mới',$2,false,NOW())`,
      [staffUserId, `Bạn được gán đơn #${order_id}.`]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Staff assigned successfully",
      assignment: insertRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("assignStaffToOrder error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * Remove assignment (admin)
 */
export const removeAssignment = async (req, res) => {
  const assignment_id = req.body.assignment_id || req.query.assignment_id;
  if (!assignment_id)
    return res.status(400).json({ message: "assignment_id is required" });

  try {
    const aRes = await pool.query("SELECT * FROM assignments WHERE id=$1", [assignment_id]);
    if (aRes.rowCount === 0)
      return res.status(404).json({ message: "Assignment not found" });

    const orderId = aRes.rows[0].order_id;

    await pool.query("DELETE FROM assignments WHERE id=$1", [assignment_id]);
    await pool.query(
      "UPDATE orders SET status='pending', status_vn=$1, updated_at=NOW() WHERE id=$2",
      [STATUS.PENDING, orderId]
    );

    res.json({ message: "Assignment removed" });
  } catch (err) {
    console.error("removeAssignment error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const listAssignments = async (req, res) => {
  const { staff_id, order_id } = req.query;
  try {
    let sql = `
      SELECT a.id, a.order_id, a.staff_id, a.assigned_at, a.status,
             o.scheduled_date, o.status as order_status, o.status_vn,
             COALESCE(o.customer_name, u.full_name) as customer_name,
             u.full_name as account_name,
             st.user_id as staff_user_id
      FROM assignments a
      LEFT JOIN orders o ON a.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN staff st ON a.staff_id = st.id
    `;
    const conditions = [];
    const params = [];
    let idx = 1;
    if (staff_id) { conditions.push(`a.staff_id = $${idx++}`); params.push(staff_id); }
    if (order_id) { conditions.push(`a.order_id = $${idx++}`); params.push(order_id); }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY a.assigned_at DESC LIMIT 200";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("listAssignments error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const acceptAssignment = async (req, res) => {
  const { assignment_id } = req.body;
  const userId = req.user?.id;
  if (!assignment_id) return res.status(400).json({ message: "assignment_id required" });

  try {
    const aRes = await pool.query(
      `SELECT a.*, st.user_id as staff_user_id, o.status_vn
       FROM assignments a
       JOIN staff st ON a.staff_id = st.id
       JOIN orders o ON o.id=a.order_id
       WHERE a.id=$1`,
      [assignment_id]
    );
    if (aRes.rowCount === 0) return res.status(404).json({ message: "Assignment not found" });
    if (aRes.rows[0].staff_user_id !== userId) return res.status(403).json({ message: "Forbidden" });

    await pool.query("UPDATE assignments SET status='in_progress' WHERE id=$1", [assignment_id]);
    await pool.query("UPDATE orders SET status='in_progress', status_vn=$1, updated_at=NOW() WHERE id=(SELECT order_id FROM assignments WHERE id=$2)", [STATUS.MOVING, assignment_id]);

    res.json({ message: "Assignment accepted" });
  } catch (err) {
    console.error("acceptAssignment error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const completeAssignment = async (req, res) => {
  const { assignment_id } = req.body;
  const userId = req.user?.id;
  if (!assignment_id) return res.status(400).json({ message: "assignment_id required" });

  try {
    const aRes = await pool.query(
      `SELECT a.*, st.user_id as staff_user_id
       FROM assignments a
       JOIN staff st ON a.staff_id = st.id
       WHERE a.id=$1`,
      [assignment_id]
    );
    if (aRes.rowCount === 0) return res.status(404).json({ message: "Assignment not found" });
    if (aRes.rows[0].staff_user_id !== userId) return res.status(403).json({ message: "Forbidden" });

    await pool.query("UPDATE assignments SET status='done' WHERE id=$1", [assignment_id]);
    await pool.query("UPDATE orders SET status='completed', status_vn=$1, updated_at=NOW() WHERE id=(SELECT order_id FROM assignments WHERE id=$2)", [STATUS.DONE, assignment_id]);

    res.json({ message: "Assignment completed" });
  } catch (err) {
    console.error("completeAssignment error:", err);
    res.status(500).json({ error: err.message });
  }
};
