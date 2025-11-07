import pool from "../db.js";

export const createPayment = async (req, res) => {
  const { order_id, payment_method, amount } = req.body;

  try {
    const payment = await pool.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, amount, payment_date)
       VALUES ($1, $2, 'pending', $3, NOW())
       RETURNING *`,
      [order_id, payment_method, amount]
    );

    res.status(201).json(payment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmPayment = async (req, res) => {
  const { payment_id } = req.body;
  try {
    await pool.query(
      `UPDATE payments SET payment_status='paid', payment_date=NOW() WHERE id=$1`,
      [payment_id]
    );
    res.json({ message: "Payment confirmed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
