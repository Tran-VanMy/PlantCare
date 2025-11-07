import express from "express";
import { createPayment, confirmPayment } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createPayment);
router.put("/confirm", verifyToken, confirmPayment);

export default router;
