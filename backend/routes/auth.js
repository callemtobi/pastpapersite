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
  getMe,
} from "../controllers/authController.js";
import {
  getDashboardStats,
  getRecentActivity,
  getTopDownloadedPapers,
} from "../controllers/dashboardController.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent-activity", getRecentActivity);
router.get("/dashboard/top-downloads", getTopDownloadedPapers);

router.get("/", getUsers);
router.get("/me", authenticate, getMe);
router.get("/:id", getUserById);

router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
