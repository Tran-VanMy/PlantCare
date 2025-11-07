import pool from "../db.js";

/**
 * Create order
 * - uses req.user.id as order owner (do NOT accept user_id from client)
 * - body: { services: [{ service_id, quantity, price }], scheduled_date, address, note }
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

    await client.query(`UPDATE orders SET total_price=$1 WHERE id=$2`, [total, orderId]);

    await client.query("COMMIT");
    res.status(201).json({ message: "Order created", order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("createOrder error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
