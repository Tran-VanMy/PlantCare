// server/src/routes/admin.routes.js
import express from "express";
import {
  getStats,
  listUsers,
  listServices,
  listOrders,
  updateOrderStatus,
  listStaff, // ✅ NEW
} from "../controllers/admin.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Dashboard thống kê
router.get("/stats", verifyToken, requireRole(1), getStats);

// Danh sách Users
router.get("/users", verifyToken, requireRole(1), listUsers);

// Danh sách dịch vụ
router.get("/services", verifyToken, requireRole(1), listServices);

// Danh sách đơn hàng
router.get("/orders", verifyToken, requireRole(1), listOrders);

// ✅ NEW: Danh sách staff để gán job (req18)
router.get("/staff", verifyToken, requireRole(1), listStaff);

// Cập nhật trạng thái đơn hàng
router.put("/orders/:id", verifyToken, requireRole(1), updateOrderStatus);

export default router;
