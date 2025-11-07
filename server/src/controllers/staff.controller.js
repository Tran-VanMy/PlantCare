import pool from "../db.js";

export const getStaffTasks = async (req, res) => {
  try {
    const staffId = req.user.id;
    const result = await pool.query(
      `SELECT o.id as order_id, o.scheduled_date, o.status, 
              u.full_name as customer_name, u.phone, u.address, 
              s.name as service_name
       FROM order_assignments a
       JOIN orders o ON a.order_id = o.id
       JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN services s ON oi.service_id = s.id
       WHERE a.staff_id = $1
       ORDER BY o.scheduled_date DESC`,
      [staffId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { order_id, status } = req.body;
  try {
    await pool.query(`UPDATE orders SET status=$1 WHERE id=$2`, [status, order_id]);
    res.json({ message: "Task status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
