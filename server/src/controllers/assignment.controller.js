import pool from "../db.js";

/**
 * Assign staff to order (admin)
 * body: { order_id, staff_id }
 */
export const assignStaffToOrder = async (req, res) => {
  const { order_id, staff_id } = req.body;
  if (!order_id || !staff_id) return res.status(400).json({ message: "order_id and staff_id are required" });

  try {
    const orderRes = await pool.query("SELECT id FROM orders WHERE id=$1", [order_id]);
    if (orderRes.rowCount === 0) return res.status(404).json({ message: "Order not found" });

    const staffRes = await pool.query("SELECT id FROM staff WHERE id=$1", [staff_id]);
    if (staffRes.rowCount === 0) return res.status(404).json({ message: "Staff not found" });

    const insertRes = await pool.query(
      `INSERT INTO assignments (order_id, staff_id, assigned_at, status)
       VALUES ($1,$2,NOW(),'assigned') RETURNING id, order_id, staff_id, assigned_at, status`,
      [order_id, staff_id]
    );

    await pool.query("UPDATE orders SET status='assigned', updated_at=NOW() WHERE id=$1", [order_id]);

    res.status(201).json({ message: "Staff assigned successfully", assignment: insertRes.rows[0] });
  } catch (err) {
    console.error("assignStaffToOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const removeAssignment = async (req, res) => {
  const assignment_id = req.body.assignment_id || req.query.assignment_id;
  if (!assignment_id) return res.status(400).json({ message: "assignment_id is required" });

  try {
    const aRes = await pool.query("SELECT * FROM assignments WHERE id=$1", [assignment_id]);
    if (aRes.rowCount === 0) return res.status(404).json({ message: "Assignment not found" });

    const orderId = aRes.rows[0].order_id;

    await pool.query("DELETE FROM assignments WHERE id=$1", [assignment_id]);
    // revert order status if desired
    await pool.query("UPDATE orders SET status='confirmed', updated_at=NOW() WHERE id=$1", [orderId]);

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
             o.scheduled_date, o.status as order_status,
             u.full_name as customer_name, s.user_id as staff_user_id
      FROM assignments a
      LEFT JOIN orders o ON a.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN staff s ON a.staff_id = s.id
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
      `SELECT a.*, st.user_id as staff_user_id FROM assignments a JOIN staff st ON a.staff_id = st.id WHERE a.id=$1`,
      [assignment_id]
    );
    if (aRes.rowCount === 0) return res.status(404).json({ message: "Assignment not found" });
    if (aRes.rows[0].staff_user_id !== userId) return res.status(403).json({ message: "Forbidden" });

    await pool.query("UPDATE assignments SET status='in_progress' WHERE id=$1", [assignment_id]);
    await pool.query("UPDATE orders SET status='in_progress', updated_at=NOW() WHERE id=(SELECT order_id FROM assignments WHERE id=$1)", [assignment_id]);

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
      `SELECT a.*, st.user_id as staff_user_id FROM assignments a JOIN staff st ON a.staff_id = st.id WHERE a.id=$1`,
      [assignment_id]
    );
    if (aRes.rowCount === 0) return res.status(404).json({ message: "Assignment not found" });
    if (aRes.rows[0].staff_user_id !== userId) return res.status(403).json({ message: "Forbidden" });

    await pool.query("UPDATE assignments SET status='done' WHERE id=$1", [assignment_id]);
    await pool.query("UPDATE orders SET status='completed', updated_at=NOW() WHERE id=(SELECT order_id FROM assignments WHERE id=$1)", [assignment_id]);

    res.json({ message: "Assignment completed" });
  } catch (err) {
    console.error("completeAssignment error:", err);
    res.status(500).json({ error: err.message });
  }
};
