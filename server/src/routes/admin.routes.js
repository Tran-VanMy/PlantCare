// server/src/routes/admin.routes.js
import express from "express";
import {
  getStats,
  listUsers,
  listServices,
  listOrders,
  updateOrderStatus,
  listStaff,
  deleteUser,   // ✅ NEW
  deleteOrder,  // ✅ NEW
} from "../controllers/admin.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Dashboard thống kê
router.get("/stats", verifyToken, requireRole(1), getStats);

// Danh sách Users
router.get("/users", verifyToken, requireRole(1), listUsers);

// ✅ NEW: Xóa user
router.delete("/users/:id", verifyToken, requireRole(1), deleteUser);

// Danh sách dịch vụ
router.get("/services", verifyToken, requireRole(1), listServices);

// Danh sách đơn hàng
router.get("/orders", verifyToken, requireRole(1), listOrders);

// ✅ NEW: Xóa order khỏi CSDL
router.delete("/orders/:id", verifyToken, requireRole(1), deleteOrder);

// ✅ Danh sách staff để gán job
router.get("/staff", verifyToken, requireRole(1), listStaff);

// Cập nhật trạng thái đơn hàng
router.put("/orders/:id", verifyToken, requireRole(1), updateOrderStatus);

export default router;
