// server/src/controllers/services.controller.js
import db from "../db.js";

/**
 * GET /api/services
 * Query params (optional):
 * - active=true|false
 * - limit, offset
 */
export const getAllServices = async (req, res) => {
  try {
    const { active, limit, offset } = req.query;

    let base =
      "SELECT id, name, description, price, duration_minutes, image_url, is_active FROM services";
    const params = [];
    const wheres = [];

    if (typeof active !== "undefined") {
      params.push(active === "true");
      wheres.push(`is_active = $${params.length}`);
    }

    if (wheres.length) base += " WHERE " + wheres.join(" AND ");

    // default limit 12
    const lim = Number(limit) || 12;
    const off = Number(offset) || 0;
    params.push(lim);
    params.push(off);
    base += ` ORDER BY id ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await db.query(base, params);
    return res.json({ services: result.rows });
  } catch (err) {
    console.error("getAllServices error", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
