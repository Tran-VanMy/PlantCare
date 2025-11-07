import express from "express";
import {
  assignStaffToOrder,
  removeAssignment,
  listAssignments,
  acceptAssignment,
  completeAssignment,
} from "../controllers/assignment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRole(1), listAssignments);
router.post("/", verifyToken, requireRole(1), assignStaffToOrder);
router.delete("/", verifyToken, requireRole(1), removeAssignment);

router.put("/accept", verifyToken, requireRole(2), acceptAssignment);
router.put("/complete", verifyToken, requireRole(2), completeAssignment);

export default router;
