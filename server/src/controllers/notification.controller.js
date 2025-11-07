import pool from "../db.js";

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, title, message, is_read, created_at 
       FROM notifications 
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query(`UPDATE notifications SET is_read=true WHERE id=$1`, [id]);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
