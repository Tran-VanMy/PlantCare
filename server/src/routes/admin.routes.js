// server/src/routes/admin.routes.js
import express from "express";
import {
  getStats,
  listUsers,
  listServices,
  listOrders,
  updateOrderStatus
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

// Cập nhật trạng thái đơn hàng
router.put("/orders/:id", verifyToken, requireRole(1), updateOrderStatus);

export default router;
