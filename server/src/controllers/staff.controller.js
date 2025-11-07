import pool from "../db.js";

/**
 * Get tasks for staff
 * The staff authenticates with user token; we map user -> staff.id
 */
export const getStaffTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    // find staff id from user
    const st = await pool.query("SELECT id FROM staff WHERE user_id=$1", [userId]);
    if (st.rowCount === 0) return res.status(404).json({ message: "Staff record not found" });
    const staffId = st.rows[0].id;

    const q = `
      SELECT a.id as assignment_id, a.order_id, a.status as assignment_status, a.assigned_at,
             o.scheduled_date, o.status as order_status, o.address, o.note, o.total_price,
             u.full_name as customer_name, u.phone as customer_phone,
             oi.service_id, oi.quantity, oi.price,
             s.name as service_name
      FROM assignments a
      JOIN orders o ON a.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN services s ON oi.service_id = s.id
      WHERE a.staff_id = $1
      ORDER BY o.scheduled_date DESC
    `;
    const result = await pool.query(q, [staffId]);
    res.json(result.rows);
  } catch (err) {
    console.error("getStaffTasks error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a task / order status (staff)
 * body: { order_id, status }
 */
export const updateTaskStatus = async (req, res) => {
  const { order_id, status } = req.body;
  if (!order_id || !status) return res.status(400).json({ message: "order_id and status required" });

  try {
    // verify that current user is assigned to this order
    const userId = req.user.id;
    const st = await pool.query("SELECT id FROM staff WHERE user_id=$1", [userId]);
    if (st.rowCount === 0) return res.status(404).json({ message: "Staff record not found" });
    const staffId = st.rows[0].id;

    const aRes = await pool.query("SELECT * FROM assignments WHERE order_id=$1 AND staff_id=$2", [order_id, staffId]);
    if (aRes.rowCount === 0) return res.status(403).json({ message: "Not assigned to this order" });

    await pool.query(`UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2`, [status, order_id]);
    // optionally update assignment.status too
    if (status === "completed" || status === "done") {
      // mark assignment done
      await pool.query(`UPDATE assignments SET status='done' WHERE order_id=$1 AND staff_id=$2`, [order_id, staffId]);
    } else if (status === "in_progress") {
      await pool.query(`UPDATE assignments SET status='in_progress' WHERE order_id=$1 AND staff_id=$2`, [order_id, staffId]);
    }

    res.json({ message: "Task status updated" });
  } catch (err) {
    console.error("updateTaskStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};
