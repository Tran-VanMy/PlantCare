// server/src/controllers/review.controller.js
import pool from "../db.js";

// POST /api/reviews
export const createReview = async (req, res) => {
  const userId = req.user.id;
  const { order_id, stars, comment } = req.body;

  if (!order_id || !stars) {
    return res.status(400).json({ message: "order_id và stars là bắt buộc" });
  }

  try {
    // lấy staff_id từ assignment của order
    const aRes = await pool.query(
      `SELECT staff_id FROM assignments WHERE order_id=$1 LIMIT 1`,
      [order_id]
    );
    const staffId = aRes.rowCount ? aRes.rows[0].staff_id : null;

    const r = await pool.query(
      `INSERT INTO reviews (order_id, user_id, staff_id, stars, comment)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [order_id, userId, staffId, stars, comment || null]
    );

    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error("createReview", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reviews/order/:orderId
export const listReviewsByOrder = async (req, res) => {
  const orderId = Number(req.params.orderId);
  try {
    const r = await pool.query(
      `SELECT * FROM reviews WHERE order_id=$1 ORDER BY created_at DESC`,
      [orderId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("listReviewsByOrder", err);
    res.status(500).json({ error: err.message });
  }
};
