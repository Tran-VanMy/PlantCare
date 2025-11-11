// server/src/routes/plants.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getCustomerPlants, createPlant } from "../controllers/plants.controller.js";

const router = express.Router();

// GET /api/customers/:id/plants  (public but returns only that user's plants)
router.get("/customers/:id/plants", verifyToken, getCustomerPlants);

// POST /api/plants  (create plant for current user)
router.post("/plants", verifyToken, createPlant);

export default router;
