// server/src/routes/review.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createReview, listReviewsByOrder } from "../controllers/review.controller.js";

const router = express.Router();

// customer tạo đánh giá sau khi hoàn tất
router.post("/", verifyToken, createReview);

// xem review theo order
router.get("/order/:orderId", verifyToken, listReviewsByOrder);

export default router;
