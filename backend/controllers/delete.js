// controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs"; // or argon2
import { userRoles } from "../models/User.js";

// ── Helper: Exclude sensitive fields ──────────────────────────
const excludeSensitiveFields = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  const {
    password,
    otp,
    otpExpiresAt,
    resetToken,
    resetTokenExpiresAt,
    ...safeUser
  } = userObj;
  return safeUser;
};

// ── Helper: Validate required fields ──────────────────────────
const validateUserFields = (data, isCreate = true) => {
  const errors = [];

  if (isCreate) {
    if (!data.name?.trim()) errors.push("Name is required");
    if (!data.email?.trim()) errors.push("Email is required");
    if (!data.studentId) errors.push("Student ID is required");
    if (!data.department?.trim()) errors.push("Department is required");
    if (!data.password) errors.push("Password is required");
  }

  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Please provide a valid email");
  }

  if (data.password && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
};

// ── 1. Get All Users ─────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      status = "all",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    if (role !== "all") {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

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
      users: users.map(excludeSensitiveFields),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ── 2. Get Single User ──────────────────────────────────────────
export const getUserById = async (req, res) => {
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
      user: excludeSensitiveFields(user),
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ── 3. Create User (Admin) ──────────────────────────────────────
export const createUser = async (req, res) => {
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

    // ── Validate required fields ──────────────────────────────
    const validationErrors = validateUserFields(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // ── Check if email already exists ──────────────────────────
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ── Check if student ID already exists ─────────────────────
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID already exists",
      });
    }

    // ── Hash password ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Create user ─────────────────────────────────────────────
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
      user: excludeSensitiveFields(user),
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ── 4. Update User (Admin) ──────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId, department, password, role, isActive } =
      req.body;

    // ── Find user ──────────────────────────────────────────────
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ── Validate email uniqueness if changing ──────────────────
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // ── Validate student ID uniqueness if changing ─────────────
    if (studentId && studentId !== user.studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already exists",
        });
      }
    }

    // ── Update fields ──────────────────────────────────────────
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
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: excludeSensitiveFields(user),
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ── 5. Delete User ──────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ── Find user ──────────────────────────────────────────────
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ── Prevent deleting self ──────────────────────────────────
    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // ── Prevent deleting the last admin ────────────────────────
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

    // ── Delete user ─────────────────────────────────────────────
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ── 6. Bulk Delete Users ────────────────────────────────────────
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of user IDs",
      });
    }

    // ── Prevent deleting self ──────────────────────────────────
    const selfId = req.user?.id;
    if (ids.includes(selfId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // ── Find users to delete ────────────────────────────────────
    const usersToDelete = await User.find({ _id: { $in: ids } });

    // ── Prevent deleting all admins ─────────────────────────────
    const adminIds = usersToDelete
      .filter((u) => u.role === "admin" || u.role === "super_admin")
      .map((u) => u._id.toString());

    if (adminIds.length > 0) {
      const remainingAdmins = await User.countDocuments({
        role: { $in: ["admin", "super_admin"] },
        isActive: true,
        _id: { $nin: adminIds },
      });

      if (remainingAdmins === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete all admin users. At least one admin must remain.",
        });
      }
    }

    // ── Delete users ─────────────────────────────────────────────
    const result = await User.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} user(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ── 7. Get User Stats (for dashboard) ───────────────────────────
export const getUserStats = async (req, res) => {
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
      stats: {
        total,
        active,
        inactive,
        admins,
        verified,
        unverified,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserStats,
};
