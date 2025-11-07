import express from "express";
import { getNotifications, markAsRead, createNotification } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/", verifyToken, markAsRead);
router.post("/", verifyToken, requireRole(1), createNotification);

export default router;
