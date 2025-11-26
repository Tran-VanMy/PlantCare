// server/src/routes/staff.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  listAvailableOrders,
  listMyTasks,
  getTaskDetail,
  acceptOrder,
  rejectOrder,
  moveOrder,
  startCareOrder,
  completeOrder,
  taskHistory,
  incomeStats,
} from "../controllers/staff.controller.js";

const router = express.Router();

// Các đơn chưa ai nhận
router.get("/orders/available", verifyToken, requireRole(2), listAvailableOrders);

// Nhiệm vụ của staff (đơn đã nhận)
router.get("/tasks", verifyToken, requireRole(2), listMyTasks);
router.get("/tasks/:id", verifyToken, requireRole(2), getTaskDetail);

// Actions
router.put("/orders/:id/accept", verifyToken, requireRole(2), acceptOrder);
router.put("/orders/:id/reject", verifyToken, requireRole(2), rejectOrder);
router.put("/orders/:id/move", verifyToken, requireRole(2), moveOrder);
router.put("/orders/:id/care", verifyToken, requireRole(2), startCareOrder);
router.put("/orders/:id/complete", verifyToken, requireRole(2), completeOrder);

// History & stats
router.get("/tasks/history", verifyToken, requireRole(2), taskHistory);
router.get("/stats/income", verifyToken, requireRole(2), incomeStats);

export default router;
