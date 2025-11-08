// server/src/controllers/admin.controller.js
import pool from "../db.js";

/**
 * GET /api/admin/stats
 * Trả về: { orders, staff, customers, revenue }
 */
export const getStats = async (req, res) => {
  try {
    const ordersRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM orders"
    );

    // STAFF = users có role_id = 2
    const staffRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role_id = 2"
    );

    const customersRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role_id = 3"
    );

    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(amount),0)::numeric(12,2) AS sum FROM payments WHERE payment_status = 'paid'"
    );

    return res.json({
      orders: ordersRes.rows[0].count,
      staff: staffRes.rows[0].count,
      customers: customersRes.rows[0].count,
      revenue: Number(revenueRes.rows[0].sum),
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/users
 */
export const listUsers = async (req, res) => {
  try {
    const q = `
      SELECT u.id, u.full_name, u.email, u.phone, u.address, 
             u.role_id, r.name AS role_name, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
      LIMIT 1000
    `;
    const result = await pool.query(q);
    return res.json(result.rows);
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/services
 */
export const listServices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, price, duration_minutes, image_url, is_active 
      FROM services 
      ORDER BY id
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error("listServices error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/orders
 */
export const listOrders = async (req, res) => {
  try {
    const q = `
      SELECT
        o.id,
        o.user_id,
        u.full_name AS customer_name,
        o.status,
        o.total_price AS total,
        o.scheduled_date AS date,
        TO_CHAR(o.scheduled_date, 'YYYY-MM-DD') AS date_str,
        STRING_AGG(s.name, ', ') AS service_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON oi.service_id = s.id
      GROUP BY o.id, o.user_id, u.full_name, o.status, o.total_price, o.scheduled_date
      ORDER BY o.scheduled_date DESC
      LIMIT 500
    `;
    const result = await pool.query(q);

    const rows = result.rows.map(r => ({
      id: r.id,
      customer_name: r.customer_name,
      service_name: r.service_name,
      total: Number(r.total) || 0,
      date: r.date_str || r.date,
      status: r.status,
    }));

    return res.json(rows);
  } catch (err) {
    console.error("listOrders error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/admin/orders/:id
 */
export const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status)
    return res.status(400).json({ message: "status is required" });

  try {
    const check = await pool.query(
      "SELECT id FROM orders WHERE id=$1",
      [orderId]
    );

    if (check.rowCount === 0)
      return res.status(404).json({ message: "Order not found" });

    await pool.query(
      "UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2",
      [status, orderId]
    );

    return res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ error: err.message });
  }
};
