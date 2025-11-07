import pool from "../db.js";

export const getAllServices = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services WHERE is_active=true");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
