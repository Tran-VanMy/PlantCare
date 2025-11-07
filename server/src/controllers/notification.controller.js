import pool from "../db.js";

export const getNotifications = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const q = `SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200`;
    const result = await pool.query(q, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "id required" });

  try {
    const nRes = await pool.query("SELECT * FROM notifications WHERE id=$1 AND user_id=$2", [id, userId]);
    if (nRes.rowCount === 0) return res.status(404).json({ message: "Notification not found" });

    await pool.query("UPDATE notifications SET is_read=true WHERE id=$1", [id]);
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createNotification = async (req, res) => {
  const { user_id, title, message } = req.body;
  if (!user_id || !title || !message) return res.status(400).json({ message: "user_id, title, message required" });

  try {
    const insert = await pool.query(
      "INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES ($1,$2,$3,false,NOW()) RETURNING *",
      [user_id, title, message]
    );
    res.status(201).json({ message: "Notification created", notification: insert.rows[0] });
  } catch (err) {
    console.error("createNotification error:", err);
    res.status(500).json({ error: err.message });
  }
};
