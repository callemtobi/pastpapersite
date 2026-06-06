import express from "express";
import {
  login,
  register,
  logout,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";

const router = express.Router();

router.post("/login", loginRateLimiter, login);
(router.post("/login/forgot-password", forgotPassword),
  router.post("/logout", logout));
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;
