import pool from "../db.js";
import bcrypt from "bcryptjs";

/**
 * Get current user info
 */
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT id, full_name, email, phone, address, role_id, created_at, updated_at
       FROM users WHERE id=$1`,
      [userId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found" });
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

/**
 * Change password for current user
 * body: { old_password, new_password }
 */
export const changeMyPassword = async (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res
      .status(400)
      .json({ message: "old_password và new_password là bắt buộc" });
  }

  try {
    const uRes = await pool.query(
      "SELECT password_hash FROM users WHERE id=$1",
      [userId]
    );
    if (uRes.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(old_password, uRes.rows[0].password_hash);
    if (!ok) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query(
      "UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2",
      [hash, userId]
    );

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("changeMyPassword error:", err);
    res.status(500).json({ error: err.message });
  }
};
