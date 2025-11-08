// server/src/routes/staff.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

import {
  getTodayTasks,
  getAllTasks,
  getTaskDetail,
  startTask,
  completeTask
} from "../controllers/staff.controller.js";

const router = express.Router();

router.get("/tasks/today", verifyToken, requireRole(2), getTodayTasks);
router.get("/tasks", verifyToken, requireRole(2), getAllTasks);
router.get("/tasks/:id", verifyToken, requireRole(2), getTaskDetail);

router.put("/tasks/:id/start", verifyToken, requireRole(2), startTask);
router.put("/tasks/:id/complete", verifyToken, requireRole(2), completeTask);

export default router;
