// server/src/routes/order.routes.js
import express from "express";
import {
  createOrder,
  getCustomerOrders,
  cancelOrderByCustomer,
} from "../controllers/orders.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/orders (customer create)
router.post("/", verifyToken, createOrder);

// GET /api/customers/:id/orders
router.get("/customers/:id/orders", verifyToken, getCustomerOrders);

// PUT /api/orders/:id/cancel (customer cancel if not accepted)
router.put("/:id/cancel", verifyToken, cancelOrderByCustomer);

export default router;
