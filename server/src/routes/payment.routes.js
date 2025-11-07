import express from "express";
import { createPayment, confirmPayment, listPayments } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createPayment);
router.put("/confirm", verifyToken, requireRole(1), confirmPayment);
router.get("/", verifyToken, listPayments);

export default router;
