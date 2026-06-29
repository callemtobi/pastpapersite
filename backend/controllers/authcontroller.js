import User from "../models/User.js";
import { Resend } from "resend";
// import { SignJWT } from "jose";
import argon2 from "argon2";
import {
  generateToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "../utils/jwt.js";

const resend = new Resend(process.env.RESEND_KEY);

// const signToken = async (userId) => {
//   const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//   console.log("Secret key: " + secret);

//   return new SignJWT({ sub: userId.toString() })
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(secret);
// };

const generateOTP = async () => {
  const plain = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await argon2.hash(plain);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return { plain, hash, expiresAt };
};

// Send OTP through email
const sendOTPEmail = async (email, otp, expiresAt) => {
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

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      message: "User's fetched successfully.",
      users,
    });
  } catch (err) {
    console.error("Get papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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
      return res.status(401).json({
        success: false,
        message: "No account found with this email.",
        attemptsRemaining: req.rateLimit.remaining,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        attemptsRemaining: req.rateLimit.remaining,
      });
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
    const hashedPassword = await argon2.hash(password);
    console.log(`Hashing password: ${hashedPassword}`);

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

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        messaege: "Email is required.",
      });
    }

    // find user in DB
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(200).json({
        success: false,
        message:
          "If that email is registered, you'll receive a reset link shortly.",
      });
    }

    // ── Build a one-time-use JWT reset token ───────────────────
    // The token's fingerprint is derived from the user's current password hash,
    // so it becomes invalid the moment the password is changed.
    const resetToken = await createPasswordResetToken(user._id, user.password);

    // Record when we issued it so we can cross-reference in resetPassword
    await User.updateOne({ _id: user._id }, { resetTokenIssuedAt: new Date() });

    // ── Send email with reset link ─────────────────────────────
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If that email is registered, you'll receive a reset link shortly.",
    });
  } catch (err) {
    console.error("Forgot password error: " + err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token is required." });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both password fields are required.",
      });
    }

    // Validate passwords

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    // ── Verify the JWT and fingerprint ─────────────────────────
    // We need the user's current password hash to verify the fingerprint,
    // so we extract userId first, then look up the user.
    let userId;
    let user;

    try {
      // Do a preliminary decode just to get the userId from sub
      // const { verifyToken } = await import("../utils/jwt.js");
      // const preliminary = await verifyToken(token);
      const { decodeJwt } = await import("jose");
      const preliminary = decodeJwt(token);

      if (preliminary.purpose !== "password-reset" || !preliminary.sub) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired reset token." });
      }

      userId = preliminary.sub;
      user = await User.findById(userId);

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired reset token." });
      }
      // Now do the full verification (fingerprint check against current hash)
      await verifyPasswordResetToken(token, user.password);
    } catch {
      // verifyToken / verifyPasswordResetToken throw on expiry or tampering
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired reset token." });
    }

    // ── Guard: reject if no reset was ever requested ───────────
    if (!user.resetTokenIssuedAt) {
      return res
        .status(401)
        .json({ success: false, message: "No password reset was requested." });
    }
    console.log("Updating user password...");

    // ── Hash new password and save ─────────────────────────────
    const hashedPassword = await argon2.hash(password);
    console.log("Password reset successful for user:", user.email);

    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetTokenIssuedAt: null, // invalidate — can't reuse same token
        // failedLoginAttempts: 0, // clear any lockout while we're here
        // lockoutUntil: null,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Error resetting password" + err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ----------------------------------------------------------------------
// ── Admin User Management Functions ─────────────────────────────

// ── Get All Users (Admin) ──────────────────────────────────────
export const adminGetUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      status = "all",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }
    if (role !== "all") filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select(
          "-password -otp -otpExpiresAt -resetToken -resetTokenExpiresAt -__v",
        ),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ── Get Single User (Admin) ────────────────────────────────────
export const adminGetUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "-password -otp -otpExpiresAt -resetToken -resetTokenExpiresAt -__v",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// ── Create User (Admin) ─────────────────────────────────────────
export const adminCreateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      department,
      password,
      role = "user",
      isActive = true,
    } = req.body;

    // Validation
    if (!name || !email || !studentId || !department || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing
    const existing = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email or Student ID already exists",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      name,
      email,
      studentId,
      department,
      password: hashedPassword,
      role,
      isActive,
      isVerified: true, // Admin-created users are verified by default
      createdBy: req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// ── Update User (Admin) ─────────────────────────────────────────
export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId, department, password, role, isActive } =
      req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check email uniqueness
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Check student ID uniqueness
    if (studentId && studentId !== user.studentId) {
      const existing = await User.findOne({ studentId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists",
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (studentId) user.studentId = studentId;
    if (department) user.department = department;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      user.password = await argon2.hash(password);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// ── Delete User (Admin) ─────────────────────────────────────────
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting the last admin
    if (user.role === "admin" || user.role === "super_admin") {
      const adminCount = await User.countDocuments({
        role: { $in: ["admin", "super_admin"] },
        isActive: true,
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user",
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ── Bulk Delete Users (Admin) ──────────────────────────────────
export const adminBulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of user IDs",
      });
    }

    // Prevent deleting self
    const selfId = req.user?.id;
    if (ids.includes(selfId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting all admins
    const adminUsers = await User.find({
      _id: { $in: ids },
      role: { $in: ["admin", "super_admin"] },
    });

    if (adminUsers.length > 0) {
      const remainingAdmins = await User.countDocuments({
        role: { $in: ["admin", "super_admin"] },
        isActive: true,
        _id: { $nin: adminUsers.map((u) => u._id) },
      });

      if (remainingAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete all admin users",
        });
      }
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} user(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Admin bulk delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete users",
    });
  }
};

// ── Get User Stats (Admin) ──────────────────────────────────────
export const adminGetUserStats = async (req, res) => {
  try {
    const [total, active, inactive, admins, verified, unverified] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ role: { $in: ["admin", "super_admin"] } }),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ isVerified: false }),
      ]);

    return res.status(200).json({
      success: true,
      stats: { total, active, inactive, admins, verified, unverified },
    });
  } catch (error) {
    console.error("Admin get stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

export default {
  getUsers,
  login,
  register,
  logout,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  adminGetUsers,
  adminGetUserById,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminBulkDeleteUsers,
  adminGetUserStats,
};
