import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { listMyVouchers } from "../controllers/voucher.controller.js";

const router = express.Router();
router.get("/me", verifyToken, listMyVouchers);
export default router;
