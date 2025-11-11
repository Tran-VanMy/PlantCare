// server/src/controllers/plants.controller.js
import pool from "../db.js";

/**
 * GET plants for a given customer id
 * Requires authentication — but we allow admin viewing other customer's plants.
 */
export const getCustomerPlants = async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const user = req.user;

    // If requester is not admin and not the same user -> forbidden
    if (user.role !== 1 && user.id !== customerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const q = `SELECT id, user_id, name, type, location, description, created_at FROM plants WHERE user_id=$1 ORDER BY id DESC`;
    const result = await pool.query(q, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error("getCustomerPlants error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST create plant for current user
 * body: { name, type, location, description }
 */
export const createPlant = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, type, location, description } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });

    const insert = await pool.query(
      `INSERT INTO plants (user_id, name, type, location, description, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
      [userId, name, type || null, location || null, description || null]
    );

    res.status(201).json({ message: "Plant created", plant: insert.rows[0] });
  } catch (err) {
    console.error("createPlant error:", err);
    res.status(500).json({ error: err.message });
  }
};
