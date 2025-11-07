import express from "express";
import { getStaffTasks, updateTaskStatus } from "../controllers/staff.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/tasks", verifyToken, requireRole(2), getStaffTasks);
router.put("/tasks", verifyToken, requireRole(2), updateTaskStatus);

export default router;
