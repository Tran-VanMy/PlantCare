import pool from "../db.js";

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT id, full_name, email, phone, address, avatar_url, role_id FROM users WHERE id=$1`,
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserInfo = async (req, res) => {
  const { full_name, phone, address, avatar_url } = req.body;
  const userId = req.user.id;
  try {
    await pool.query(
      `UPDATE users SET full_name=$1, phone=$2, address=$3, avatar_url=$4, updated_at=NOW() WHERE id=$5`,
      [full_name, phone, address, avatar_url, userId]
    );
    res.json({ message: "User info updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
