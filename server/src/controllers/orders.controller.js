import pool from "../db.js";

export const createOrder = async (req, res) => {
  const { user_id, services, scheduled_date, address, note } = req.body;

  try {
    const orderRes = await pool.query(
      `INSERT INTO orders (user_id, scheduled_date, address, note, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
      [user_id, scheduled_date, address, note]
    );

    const orderId = orderRes.rows[0].id;

    for (let s of services) {
      await pool.query(
        "INSERT INTO order_items (order_id, service_id, quantity, price) VALUES ($1,$2,$3,$4)",
        [orderId, s.service_id, s.quantity, s.price]
      );
    }

    res.status(201).json({ message: "Order created", order_id: orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
