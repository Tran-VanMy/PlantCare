// server/src/routes/order.routes.js
import express from "express";
import { createOrder, getCustomerOrders } from "../controllers/orders.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/orders  (create)
router.post("/", verifyToken, createOrder);

// GET /api/customers/:id/orders  (get customer's orders)
router.get("/customers/:id/orders", verifyToken, getCustomerOrders);

export default router;
