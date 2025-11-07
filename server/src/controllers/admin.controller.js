import pool from "../db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const orders = await pool.query("SELECT COUNT(*) FROM orders");
    const revenue = await pool.query("SELECT SUM(amount) FROM payments WHERE payment_status='paid'");
    res.json({
      total_users: users.rows[0].count,
      total_orders: orders.rows[0].count,
      total_revenue: revenue.rows[0].sum || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
