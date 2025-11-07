import express from "express";
import { assignStaffToOrder, removeAssignment } from "../controllers/assignment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole(1), assignStaffToOrder);
router.delete("/", verifyToken, requireRole(1), removeAssignment);

export default router;
