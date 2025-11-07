import pool from "../db.js";

export const assignStaffToOrder = async (req, res) => {
  const { order_id, staff_id } = req.body;

  try {
    await pool.query(
      `INSERT INTO order_assignments (order_id, staff_id, assigned_date)
       VALUES ($1, $2, NOW())`,
      [order_id, staff_id]
    );
    res.json({ message: "Staff assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeAssignment = async (req, res) => {
  const { order_id, staff_id } = req.body;
  try {
    await pool.query(
      `DELETE FROM order_assignments WHERE order_id=$1 AND staff_id=$2`,
      [order_id, staff_id]
    );
    res.json({ message: "Assignment removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
