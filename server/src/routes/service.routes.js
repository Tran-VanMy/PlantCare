import express from "express";
import { getAllServices } from "../controllers/services.controller.js";

const router = express.Router();

router.get("/", getAllServices);

export default router;
