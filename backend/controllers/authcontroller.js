import User from "../models/User.js";
import { Resend } from "resend";
// import { SignJWT } from "jose";
import argon2 from "argon2";
import { generateToken } from "../utils/jwt.js";

// const signToken = async (userId) => {
//   const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//   console.log("Secret key: " + secret);

//   return new SignJWT({ sub: userId.toString() })
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(secret);
// };

// Generate OTP (5 digits) and
// Hash it with argon2
// Set OTP expiry
const generateOTP = async () => {
  const plain = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await argon2.hash(plain);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return { plain, hash, expiresAt };
};

// Send OTP through email
const sendOTPEmail = async (email, otp, expiresAt) => {
  const resend = new Resend(process.env.RESEND_KEY);
  const expiryFormatted = expiresAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Your Pasty Paperyyy verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4FC3FC">Verify your PaperVault account</h2>
        <p>Use the code below to complete your registration. It expires at <strong>${expiryFormatted}</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;margin:24px 0;color:#111">
          ${otp}
        </div>
        <p style="color:#888;font-size:12px">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

// ── Controllers ───────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = await generateToken(user._id);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const register = async (req, res) => {
  try {
    const resend = new Resend(process.env.RESEND_KEY);
    const { name, email, studentId, department, password, confirmPassword } =
      req.body;

    // ── Basic validation ───────────────────────────────────────
    if (
      !name ||
      !email ||
      !studentId ||
      !department ||
      !password ||
      !confirmPassword
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    // ── Duplicate check ────────────────────────────────────────
    const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email or Student ID already exists.",
      });
    }

    // Hash password
    console.log(`Before Hashing: ${password}`);
    const hashedPassword = await argon2.hash(password);
    console.log(`After Hashing: ${hashedPassword}`);

    // Generate OTP
    // ── Generate OTP ───────────────────────────────────────────
    const {
      plain: otpPlain,
      hash: otpHash,
      expiresAt: otpExpiresAt,
    } = await generateOTP();

    // ── Create user (unverified) ───────────────────────────────
    await User.create({
      name,
      email,
      studentId,
      department,
      password: hashedPassword,
      isVerified: false,
      otp: otpHash,
      otpExpiresAt,
    });

    // ── Send OTP email ─────────────────────────────────────────
    await sendOTPEmail(email, otpPlain, otpExpiresAt);

    return res.status(201).json({
      success: true,
      message:
        "Account created. Please check your email for the verification code.",
    });
  } catch (err) {
    console.error("--------> Error: ", err);
  }
};

export const logout = async (req, res) => {
  console.log("Cookies is cleared.");
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error("logout error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// export const logout = async (req, res) => {
//   try {
//     const refreshToken = req.cookies?.refresh_token;

//     if (refreshToken) {
//       await db.refreshTokens.delete(refreshToken).catch(() => {}); // best-effort
//     }

//     return res.json({ message: "Logged out" });
//   } catch (error) {
//     console.error("logout error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// };

// Match OTPs
// set isVerified to true
// Issue JWT

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    // ── Find unverified user with a non-expired OTP ────────────
    const user = await User.findOne({
      email,
      isVerified: false,
      otpExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "No pending verification found for this email, or the code has expired.",
      });
    }

    // ── Compare submitted OTP against stored hash ──────────────
    const otpMatch = await argon2.verify(user.otp, otp);
    if (!otpMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code." });
    }

    // ── Mark verified and clear OTP fields ─────────────────────
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // ── Issue JWT ──────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    // ── Only allow resend for unverified accounts ──────────────
    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No unverified account found for this email.",
      });
    }

    // ── Generate and store a fresh OTP ────────────────────────
    const {
      plain: otpPlain,
      hash: otpHash,
      expiresAt: otpExpiresAt,
    } = await generateOTP();

    user.otp = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // ── Resend email ───────────────────────────────────────────
    await sendOTPEmail(email, otpPlain, otpExpiresAt);

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("resendOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export default { login, register, logout, verifyOtp, resendOtp };
