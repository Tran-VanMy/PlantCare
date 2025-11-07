import express from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, requireRole(1), getDashboardStats);

export default router;
