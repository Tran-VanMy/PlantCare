import express from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/", verifyToken, markAsRead);

export default router;
