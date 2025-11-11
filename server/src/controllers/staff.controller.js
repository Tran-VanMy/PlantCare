// server/src/controllers/staff.controller.js
import pool from "../db.js";

/**
 * Helper: lấy staff.id từ user id (req.user.id)
 * Nếu không có record staff -> trả null
 */
const getStaffIdByUser = async (userId) => {
  const r = await pool.query("SELECT id FROM staff WHERE user_id = $1 LIMIT 1", [userId]);
  if (r.rowCount === 0) return null;
  return r.rows[0].id;
};

/**
 * Lấy danh sách công việc hôm nay (cho nhân viên)
 */
export const getTodayTasks = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staffId = await getStaffIdByUser(staffUserId);
    if (!staffId) return res.status(404).json({ message: "Staff profile not found for this user" });

    const q = `
      SELECT 
        t.id, 
        t.title,
        t.status,
        o.address,
        o.scheduled_date,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        STRING_AGG(s.name, ', ') AS services
      FROM tasks t
      JOIN assignments a ON a.id = t.assignment_id
      JOIN orders o ON o.id = a.order_id
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON s.id = oi.service_id
      WHERE a.staff_id = $1 
        AND DATE(o.scheduled_date) = CURRENT_DATE
      GROUP BY t.id, o.address, o.scheduled_date, u.full_name, u.phone
      ORDER BY t.id DESC
    `;
    const result = await pool.query(q, [staffId]);

    res.json(result.rows);
  } catch (err) {
    console.error("getTodayTasks error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy tất cả công việc của nhân viên
 */
export const getAllTasks = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staffId = await getStaffIdByUser(staffUserId);
    if (!staffId) return res.status(404).json({ message: "Staff profile not found for this user" });

    const q = `
      SELECT 
        t.id, 
        t.title,
        t.status,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        o.address,
        o.scheduled_date,
        STRING_AGG(s.name, ', ') AS services
      FROM tasks t
      JOIN assignments a ON a.id = t.assignment_id
      JOIN orders o ON o.id = a.order_id
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON s.id = oi.service_id
      WHERE a.staff_id = $1
      GROUP BY t.id, u.full_name, u.phone, o.address, o.scheduled_date
      ORDER BY t.id DESC
    `;
    const result = await pool.query(q, [staffId]);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllTasks error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Chi tiết công việc
 */
export const getTaskDetail = async (req, res) => {
  try {
    const taskId = req.params.id;

    const q = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        o.address,
        o.scheduled_date,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        STRING_AGG(s.name, ', ') AS services
      FROM tasks t
      JOIN assignments a ON t.assignment_id = a.id
      JOIN orders o ON a.order_id = o.id
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON s.id = oi.service_id
      WHERE t.id = $1
      GROUP BY t.id, o.address, o.scheduled_date, u.full_name, u.phone
    `;
    const result = await pool.query(q, [taskId]);

    if (result.rowCount === 0) return res.status(404).json({ message: "Task not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getTaskDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Staff bắt đầu công việc
 */
export const startTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    // Optionally check staff ownership: ensure this user is assigned to this task
    const staffUserId = req.user.id;
    const staffId = await getStaffIdByUser(staffUserId);
    if (!staffId) return res.status(404).json({ message: "Staff profile not found for this user" });

    // verify ownership
    const chk = await pool.query(
      `SELECT a.* FROM tasks t JOIN assignments a ON t.assignment_id = a.id WHERE t.id=$1 AND a.staff_id=$2`,
      [taskId, staffId]
    );
    if (chk.rowCount === 0) return res.status(403).json({ message: "Forbidden" });

    await pool.query(
      "UPDATE tasks SET status='in_progress' WHERE id=$1",
      [taskId]
    );

    res.json({ message: "Task started" });
  } catch (err) {
    console.error("startTask error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Staff hoàn thành công việc
 */
export const completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const staffUserId = req.user.id;
    const staffId = await getStaffIdByUser(staffUserId);
    if (!staffId) return res.status(404).json({ message: "Staff profile not found for this user" });

    // verify ownership
    const chk = await pool.query(
      `SELECT a.* FROM tasks t JOIN assignments a ON t.assignment_id = a.id WHERE t.id=$1 AND a.staff_id=$2`,
      [taskId, staffId]
    );
    if (chk.rowCount === 0) return res.status(403).json({ message: "Forbidden" });

    await pool.query(
      "UPDATE tasks SET status='completed', completed_at=NOW() WHERE id=$1",
      [taskId]
    );

    res.json({ message: "Task completed" });
  } catch (err) {
    console.error("completeTask error:", err);
    res.status(500).json({ error: err.message });
  }
};
