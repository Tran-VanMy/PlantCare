// server/src/routes/incident.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createIncident, listMyIncidents } from "../controllers/incident.controller.js";

const router = express.Router();

// customer/staff báo sự cố
router.post("/", verifyToken, createIncident);

// user xem incident của mình
router.get("/me", verifyToken, listMyIncidents);

export default router;
