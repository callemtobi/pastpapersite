import express from "express";
import {
  login,
  register,
  logout,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getUsers,
  getUserById,
} from "../controllers/authController.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);

router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
