import pool from "../db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const orders = await pool.query("SELECT COUNT(*) FROM orders");
    const revenue = await pool.query("SELECT COALESCE(SUM(amount),0) as sum FROM payments WHERE payment_status='paid'");

    res.json({
      total_users: Number(users.rows[0].count || 0),
      total_orders: Number(orders.rows[0].count || 0),
      total_revenue: Number(revenue.rows[0].sum || 0),
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ error: err.message });
  }
};
