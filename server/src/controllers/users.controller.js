import pool from "../db.js";

/**
 * Get current user info
 */
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT id, full_name, email, phone, address, role_id FROM users WHERE id=$1`,
      [userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getUserInfo error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update current user info
 * body: { full_name, phone, address }
 */
export const updateUserInfo = async (req, res) => {
  const { full_name, phone, address } = req.body;
  const userId = req.user.id;
  try {
    await pool.query(
      `UPDATE users SET full_name=$1, phone=$2, address=$3, updated_at=NOW() WHERE id=$4`,
      [full_name || null, phone || null, address || null, userId]
    );
    res.json({ message: "User info updated successfully" });
  } catch (err) {
    console.error("updateUserInfo error:", err);
    res.status(500).json({ error: err.message });
  }
};
