import express from "express";
import {
  login,
  register,
  logout,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;
