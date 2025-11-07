import express from "express";
import { getUserInfo, updateUserInfo } from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, getUserInfo);
router.put("/me", verifyToken, updateUserInfo);

export default router;
