import express from "express";
import {
  getUserInfo,
  updateUserInfo,
  changeMyPassword,
} from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, getUserInfo);
router.put("/me", verifyToken, updateUserInfo);
router.put("/me/password", verifyToken, changeMyPassword);

export default router;
