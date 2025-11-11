// server/src/controllers/orders.controller.js
import pool from "../db.js";

/**
 * Create order
 * - uses req.user.id as order owner (do NOT accept user_id from client)
 * - body: { services: [{ service_id, quantity, price }], scheduled_date, address, note }
 *
 * After creating order we also create a payment record with payment_status='paid'
 * so that every order is considered successful (per requirement).
 */
export const createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { services, scheduled_date, address, note } = req.body;

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ message: "services is required and must be a non-empty array" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, scheduled_date, address, note, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW()) RETURNING id`,
      [userId, scheduled_date || null, address || null, note || null]
    );
    const orderId = orderRes.rows[0].id;

    let total = 0;
    for (const s of services) {
      const serviceId = s.service_id;
      const qty = Number(s.quantity || 1);
      const price = Number(s.price);
      if (!serviceId || isNaN(price)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Each service must have service_id and price" });
      }
      total += qty * price;
      await client.query(
        `INSERT INTO order_items (order_id, service_id, quantity, price)
         VALUES ($1,$2,$3,$4)`,
        [orderId, serviceId, qty, price]
      );
    }

    await client.query(`UPDATE orders SET total_price=$1, status='confirmed' WHERE id=$2`, [total, orderId]);

    // create a payment and mark as paid (always successful)
    await client.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, created_at)
       VALUES ($1, $2, $3, 'paid', $4, NOW())`,
      [orderId, total, 'cash', null]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Order created and payment confirmed", order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("createOrder error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const requester = req.user;

    // nếu requester không phải admin và không phải chủ sở hữu -> forbidden
    if (requester.role !== 1 && requester.id !== customerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const q = `
      SELECT
        o.id,
        o.total_price AS total,
        o.status,
        o.scheduled_date AS date,
        TO_CHAR(o.scheduled_date, 'YYYY-MM-DD"T"HH24:MI:SS') AS date_str,
        STRING_AGG(s.name, ', ') AS service_name
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON s.id = oi.service_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total_price, o.status, o.scheduled_date
      ORDER BY o.scheduled_date DESC
      LIMIT 1000
    `;
    const r = await pool.query(q, [customerId]);

    const rows = r.rows.map((r) => ({
      id: r.id,
      service: r.service_name,
      total: Number(r.total) || 0,
      date: r.date_str || r.date,
      status: r.status,
    }));

    res.json(rows);
  } catch (err) {
    console.error("getCustomerOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};