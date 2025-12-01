// server/src/controllers/admin.controller.js
import pool from "../db.js";
import { STATUS } from "../utils/orderStatus.js";

/**
 * Map status EN -> status VN
 */
const mapStatusVN = (status) => {
  switch (status) {
    case "pending":
      return STATUS.PENDING;
    case "confirmed":
    case "accepted":
    case "assigned":
      return STATUS.ACCEPTED;
    case "moving":
    case "in_progress":
      return STATUS.MOVING;
    case "caring":
      return STATUS.CARING;
    case "completed":
    case "done":
      return STATUS.DONE;
    case "cancelled":
      return STATUS.CANCELLED;
    default:
      return null;
  }
};

/**
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const ordersRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM orders"
    );
    const staffRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role_id = 2"
    );
    const customersRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE role_id = 3"
    );
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(amount),0)::numeric(12,2) AS sum FROM payments WHERE payment_status = 'paid'"
    );

    return res.json({
      orders: ordersRes.rows[0].count,
      staff: staffRes.rows[0].count,
      customers: customersRes.rows[0].count,
      revenue: Number(revenueRes.rows[0].sum),
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/users
 */
export const listUsers = async (req, res) => {
  try {
    const q = `
      SELECT u.id, u.full_name, u.email, u.phone, u.address, 
             u.role_id, r.name AS role_name, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
      LIMIT 1000
    `;
    const result = await pool.query(q);
    return res.json(result.rows);
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ NEW: PUT /api/admin/users/:id/role
 * - Admin đổi vai trò cho user
 * - Không cho admin tự đổi role của chính mình (tránh tự khóa quyền)
 * body: { role_id }
 */
export const updateUserRole = async (req, res) => {
  const userIdToUpdate = Number(req.params.id);
  const { role_id } = req.body;

  if (!userIdToUpdate) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const newRoleId = Number(role_id);
  if (![1, 2, 3].includes(newRoleId)) {
    return res.status(400).json({ message: "role_id must be 1 (admin), 2 (staff), or 3 (customer)" });
  }

  try {
    // Không cho admin tự đổi role của chính mình
    if (req.user.id === userIdToUpdate) {
      return res.status(400).json({ message: "Không thể tự đổi vai trò của tài khoản admin đang đăng nhập." });
    }

    const checkUser = await pool.query(
      "SELECT id, role_id FROM users WHERE id=$1",
      [userIdToUpdate]
    );
    if (checkUser.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // đảm bảo role tồn tại trong bảng roles
    const checkRole = await pool.query("SELECT id FROM roles WHERE id=$1", [newRoleId]);
    if (checkRole.rowCount === 0) {
      return res.status(400).json({ message: "Role not found in roles table" });
    }

    await pool.query(
      "UPDATE users SET role_id=$1, updated_at=NOW() WHERE id=$2",
      [newRoleId, userIdToUpdate]
    );

    // Nếu đổi sang staff mà user chưa có record staff -> tạo (giữ logic đồng bộ)
    if (newRoleId === 2) {
      const staffCheck = await pool.query(
        "SELECT id FROM staff WHERE user_id=$1 LIMIT 1",
        [userIdToUpdate]
      );
      if (staffCheck.rowCount === 0) {
        await pool.query(
          `INSERT INTO staff (user_id, specialization, availability, rating)
           VALUES ($1, null, true, 5.0)`,
          [userIdToUpdate]
        );
      }
    }

    return res.json({ message: "Role updated successfully", user_id: userIdToUpdate, role_id: newRoleId });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ DELETE /api/admin/users/:id
 * - Không cho admin tự xóa chính mình
 * - Xóa user sẽ cascade plants/orders/... theo FK
 */
export const deleteUser = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid user id" });

  try {
    if (req.user.id === id) {
      return res.status(400).json({ message: "Không thể tự xóa tài khoản admin đang đăng nhập." });
    }

    const check = await pool.query("SELECT id FROM users WHERE id=$1", [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/services
 */
export const listServices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, price, duration_minutes, image_url, is_active 
      FROM services 
      ORDER BY id
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error("listServices error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/staff
 */
export const listStaff = async (req, res) => {
  try {
    const q = `
      SELECT 
        st.id,
        st.specialization,
        st.availability,
        st.rating,
        u.full_name,
        u.phone,
        u.email
      FROM staff st
      JOIN users u ON u.id = st.user_id
      ORDER BY st.id ASC
      LIMIT 1000
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error("listStaff", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/orders
 */
export const listOrders = async (req, res) => {
  try {
    const q = `
      SELECT
        o.id,
        o.user_id,
        COALESCE(o.customer_name, u.full_name) AS customer_name,
        o.status,
        o.status_vn,
        o.total_price AS total,
        o.scheduled_date AS date,
        o.address,
        o.phone,
        o.note,
        o.voucher_code,
        STRING_AGG(s.name, ', ') AS service_name,
        p.name AS plant_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN services s ON oi.service_id = s.id
      LEFT JOIN order_plants op ON op.order_id=o.id
      LEFT JOIN plants p ON p.id=op.plant_id
      GROUP BY o.id, o.user_id, u.full_name, o.customer_name, o.status, o.status_vn, o.total_price, o.scheduled_date, o.address, o.phone, o.note, o.voucher_code, p.name
      ORDER BY o.scheduled_date DESC
      LIMIT 1000
    `;
    const result = await pool.query(q);

    return res.json(
      result.rows.map((r) => ({
        id: r.id,
        customer_name: r.customer_name,
        service_name: r.service_name,
        plant_name: r.plant_name || "—",
        total: Number(r.total) || 0,
        date: r.date,
        address: r.address,
        phone: r.phone,
        note: r.note,
        voucher_code: r.voucher_code,
        status: r.status,
        status_vn: r.status_vn,
      }))
    );
  } catch (err) {
    console.error("listOrders error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ NEW: DELETE /api/admin/orders/:id
 */
export const deleteOrder = async (req, res) => {
  const orderId = Number(req.params.id);
  if (!orderId) return res.status(400).json({ message: "Invalid order id" });

  try {
    const check = await pool.query("SELECT id FROM orders WHERE id=$1", [orderId]);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    await pool.query("DELETE FROM orders WHERE id=$1", [orderId]);
    return res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/admin/orders/:id
 */
export const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status)
    return res.status(400).json({ message: "status is required" });

  try {
    const check = await pool.query("SELECT * FROM orders WHERE id=$1", [orderId]);
    if (check.rowCount === 0)
      return res.status(404).json({ message: "Order not found" });

    const vn = mapStatusVN(status) || check.rows[0].status_vn;

    await pool.query(
      "UPDATE orders SET status=$1, status_vn=$2, updated_at=NOW() WHERE id=$3",
      [status, vn, orderId]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1,'Cập nhật đơn hàng',$2,false,NOW())`,
      [check.rows[0].user_id, `Đơn #${orderId} chuyển trạng thái: ${vn}`]
    );
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       SELECT st.user_id, 'Cập nhật đơn hàng', $2, false, NOW()
       FROM assignments a JOIN staff st ON a.staff_id=st.id
       WHERE a.order_id=$1`,
      [orderId, `Đơn #${orderId} chuyển trạng thái: ${vn}`]
    );

    return res.json({ message: "Order status updated", status, status_vn: vn });
  } catch (err) {
    console.error("updateOrderStatus", err);
    return res.status(500).json({ error: err.message });
  }
};
