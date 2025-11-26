// server/src/controllers/incident.controller.js
import pool from "../db.js";

// POST /api/incidents
export const createIncident = async (req, res) => {
  const userId = req.user.id;
  const { order_id, title, message } = req.body;

  if (!order_id || !title || !message) {
    return res.status(400).json({ message: "order_id, title, message là bắt buộc" });
  }

  try {
    // lấy staff_id (nếu có)
    const aRes = await pool.query(
      `SELECT staff_id FROM assignments WHERE order_id=$1 LIMIT 1`,
      [order_id]
    );
    const staffId = aRes.rowCount ? aRes.rows[0].staff_id : null;

    const r = await pool.query(
      `INSERT INTO incidents (order_id, user_id, staff_id, title, message)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [order_id, userId, staffId, title, message]
    );

    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error("createIncident", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/incidents/me
export const listMyIncidents = async (req, res) => {
  const userId = req.user.id;
  try {
    const r = await pool.query(
      `SELECT * FROM incidents WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("listMyIncidents", err);
    res.status(500).json({ error: err.message });
  }
};
