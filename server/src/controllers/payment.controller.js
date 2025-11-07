import pool from "../db.js";

/**
 * Create a payment record (user starts payment)
 * body: { order_id, payment_method, amount, transaction_id? }
 */
export const createPayment = async (req, res) => {
  const userId = req.user?.id;
  const { order_id, payment_method, amount, transaction_id } = req.body;

  if (!order_id || !payment_method || !amount) {
    return res.status(400).json({ message: "order_id, payment_method, amount required" });
  }

  try {
    const orderRes = await pool.query("SELECT * FROM orders WHERE id=$1", [order_id]);
    if (orderRes.rowCount === 0) return res.status(404).json({ message: "Order not found" });

    const order = orderRes.rows[0];
    // allow owner or admin
    if (order.user_id !== userId && req.user.role !== 1) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const pRes = await pool.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, created_at)
       VALUES ($1,$2,$3,'pending',$4,NOW()) RETURNING *`,
      [order_id, amount, payment_method, transaction_id || null]
    );

    res.status(201).json({ message: "Payment created", payment: pRes.rows[0] });
  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Confirm a payment (set paid) - admin or payment webhook logic
 * body: { payment_id }
 */
export const confirmPayment = async (req, res) => {
  const { payment_id } = req.body;
  if (!payment_id) return res.status(400).json({ message: "payment_id required" });

  try {
    const payRes = await pool.query("SELECT * FROM payments WHERE id=$1", [payment_id]);
    if (payRes.rowCount === 0) return res.status(404).json({ message: "Payment not found" });

    await pool.query("UPDATE payments SET payment_status='paid', created_at=NOW() WHERE id=$1", [payment_id]);

    // Optionally update order updated_at or status here
    const orderId = payRes.rows[0].order_id;
    await pool.query("UPDATE orders SET updated_at=NOW() WHERE id=$1", [orderId]);

    res.json({ message: "Payment confirmed" });
  } catch (err) {
    console.error("confirmPayment error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List payments (admin => all, else user's payments)
 */
export const listPayments = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.role === 1) {
      const all = await pool.query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 500");
      return res.json(all.rows);
    }

    const paymentsRes = await pool.query(
      `SELECT p.* FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.user_id = $1
       ORDER BY p.created_at DESC LIMIT 200`,
      [user.id]
    );
    res.json(paymentsRes.rows);
  } catch (err) {
    console.error("listPayments error:", err);
    res.status(500).json({ error: err.message });
  }
};
