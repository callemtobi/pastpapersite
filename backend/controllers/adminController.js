// controllers/adminController.js
import Paper from "../models/Paper.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import User from "../models/User.js";
import fs from "fs/promises";
import argon2 from "argon2";

// ── Admin User Management Functions ─────────────────────────────

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
        .populate("department", "name")
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

    // ── 🔒 Only super_admin can create admin/super_admin ────────
    if (
      (role === "admin" || role === "super_admin") &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can create admin or super admin accounts",
      });
    }

    // ── 🔒 Super_admin can only be created by super_admin ────────
    if (role === "super_admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can create super admin accounts",
      });
    }

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
      role: role || "user",
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

    // ── 🔒 Prevent editing super_admin ──────────────────────────
    if (user.role === "super_admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can modify super admin accounts",
      });
    }

    // ── 🔒 Only super_admin can assign admin roles ──────────────
    if (
      (role === "admin" || role === "super_admin") &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can assign admin roles",
      });
    }

    // ── 🔒 Prevent demoting super_admin (even by super_admin) ────
    if (user.role === "super_admin" && role && role !== "super_admin") {
      const superAdminCount = await User.countDocuments({
        role: "super_admin",
        isActive: true,
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last super admin",
        });
      }
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

    // ── 🔒 Prevent deleting self ─────────────────────────────────
    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // ── 🔒 Prevent deleting super_admin ──────────────────────────
    if (user.role === "super_admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can delete super admin accounts",
      });
    }

    // ── 🔒 Prevent deleting the last admin ──────────────────────
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

    // Prevent deleting self
    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
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

// ── SUPER ADMIN CONTROLLERS ──────────────────────────────────────

export const adminGetAdmins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      status = "all",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      role: { $in: ["admin", "super_admin"] }, // Only get admin roles
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role !== "all") filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [admins, total] = await Promise.all([
      User.find(filter)
        .populate("department", "name")
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
      admins,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
    });
  }
};

export const adminCreateAdmin = async (req, res) => {
  try {
    const { name, email, password, role = "admin", isActive = true } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Only allow creating admin or super_admin roles
    if (!["admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'super_admin'",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role,
      isActive,
      isVerified: true,
      createdBy: req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        isVerified: admin.isVerified,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin create admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

export const adminChangeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user', 'admin', or 'super_admin'",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing the last super_admin
    if (user.role === "super_admin" && role !== "super_admin") {
      const superAdminCount = await User.countDocuments({
        role: "super_admin",
        isActive: true,
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last super admin",
        });
      }
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Admin change user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change user role",
    });
  }
};

export const adminDeleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is actually an admin
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "User is not an admin",
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting the last super_admin
    if (user.role === "super_admin") {
      const superAdminCount = await User.countDocuments({
        role: "super_admin",
        isActive: true,
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last super admin",
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete admin",
    });
  }
};

// ── DEPARTMENT CONTROLLERS ──────────────────────────────────────

export const adminGetDepartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      showInactive = "false",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (showInactive === "false") {
      filter.isActive = true;
    }

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Department.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      departments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get departments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

export const adminGetDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error("Admin get department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch department",
    });
  }
};

export const adminCreateDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    // Check for duplicate
    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Admin create department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
};

export const adminUpdateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check name uniqueness
    if (name && name !== department.name) {
      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Department name already exists",
        });
      }
      department.name = name.trim();
    }

    if (isActive !== undefined) {
      // If deactivating, check if any active papers are using this department
      if (isActive === false) {
        const papersUsing = await Paper.findOne({
          department: id,
          status: { $in: ["approved", "pending"] },
        });
        if (papersUsing) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot deactivate department with active papers. Archive or reassign papers first.",
          });
        }
      }
      department.isActive = isActive;
    }

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Admin update department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
};

// ── COURSE CONTROLLERS ──────────────────────────────────────────

export const adminGetCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      showInactive = "false",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (showInactive === "false") {
      filter.isActive = true;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("department", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const adminGetCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate("department", "name");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Admin get course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

export const adminCreateCourse = async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name || !department) {
      return res.status(400).json({
        success: false,
        message: "Course name and department are required",
      });
    }

    // Verify department exists and is active
    const dept = await Department.findOne({ _id: department, isActive: true });
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: "Department not found or inactive",
      });
    }

    // Check for duplicate within same department
    const existing = await Course.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      department,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Course already exists in this department",
      });
    }

    const course = await Course.create({
      name: name.trim(),
      department,
      isActive: true,
    });

    await course.populate("department", "name");

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Admin create course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

export const adminUpdateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, isActive } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify department if changing
    if (department && department !== course.department.toString()) {
      const dept = await Department.findOne({
        _id: department,
        isActive: true,
      });
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: "Department not found or inactive",
        });
      }
      course.department = department;
    }

    // Check name uniqueness within department
    if (name && name !== course.name) {
      const existing = await Course.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        department: course.department,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Course already exists in this department",
        });
      }
      course.name = name.trim();
    }

    if (isActive !== undefined) {
      // If deactivating, check if any active papers are using this course
      if (isActive === false) {
        const papersUsing = await Paper.findOne({
          course: id,
          status: { $in: ["approved", "pending"] },
        });
        if (papersUsing) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot deactivate course with active papers. Archive or reassign papers first.",
          });
        }
      }
      course.isActive = isActive;
    }

    await course.save();
    await course.populate("department", "name");

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Admin update course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

// ── INSTRUCTOR CONTROLLERS ──────────────────────────────────────

export const adminGetInstructors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      showInactive = "false",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }
    if (showInactive === "false") {
      filter.isActive = true;
    }

    const [instructors, total] = await Promise.all([
      Instructor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Instructor.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      instructors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get instructors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructors",
    });
  }
};

export const adminGetInstructorById = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findById(id);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    return res.status(200).json({
      success: true,
      instructor,
    });
  } catch (error) {
    console.error("Admin get instructor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor",
    });
  }
};

export const adminCreateInstructor = async (req, res) => {
  try {
    const { title, name } = req.body;

    if (!title || !name) {
      return res.status(400).json({
        success: false,
        message: "Title and name are required",
      });
    }

    // Check for duplicate
    const existing = await Instructor.findOne({
      title,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Instructor already exists",
      });
    }

    const instructor = await Instructor.create({
      title,
      name: name.trim(),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Instructor created successfully",
      instructor,
    });
  } catch (error) {
    console.error("Admin create instructor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create instructor",
    });
  }
};

export const adminUpdateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, name, isActive } = req.body;

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    if (title) instructor.title = title;
    if (name && name !== instructor.name) {
      // Check for duplicate name within same title
      const existing = await Instructor.findOne({
        title: instructor.title,
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Instructor already exists with this title and name",
        });
      }
      instructor.name = name.trim();
    }

    if (isActive !== undefined) {
      // If deactivating, check if any active papers are using this instructor
      if (isActive === false) {
        const papersUsing = await Paper.findOne({
          instructor: id,
          status: { $in: ["approved", "pending"] },
        });
        if (papersUsing) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot deactivate instructor with active papers. Archive or reassign papers first.",
          });
        }
      }
      instructor.isActive = isActive;
    }

    await instructor.save();

    return res.status(200).json({
      success: true,
      message: "Instructor updated successfully",
      instructor,
    });
  } catch (error) {
    console.error("Admin update instructor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update instructor",
    });
  }
};

// ── PAPER CONTROLLERS ──────────────────────────────────────

export const adminGetPapers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      department = "all",
      year = "all",
      semester = "all",
      examType = "all",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ── Build filter ─────────────────────────────────────────────
    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (year !== "all") {
      filter.year = year;
    }

    if (semester !== "all") {
      filter.semester = semester;
    }

    if (examType !== "all") {
      filter.examType = examType;
    }

    if (department !== "all") {
      filter.department = department;
    }

    // ── Search filter ────────────────────────────────────────────
    if (search) {
      // Find matching courses, departments, instructors
      const matchingCourses = await Course.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const matchingDepartments = await Department.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const matchingInstructors = await Instructor.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      filter.$or = [
        { course: { $in: matchingCourses.map((c) => c._id) } },
        { department: { $in: matchingDepartments.map((d) => d._id) } },
        { instructor: { $in: matchingInstructors.map((i) => i._id) } },
      ];
    }

    // ── Query with populate ──────────────────────────────────────
    const [papers, total] = await Promise.all([
      Paper.find(filter)
        .populate("course", "name")
        .populate("department", "name")
        .populate("instructor", "title name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Paper.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      papers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const adminGetPaperById = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findById(id)
      .populate("course", "name")
      .populate("department", "name")
      .populate("instructor", "title name");

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      paper,
    });
  } catch (error) {
    console.error("Admin get paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const adminUpdatePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      course,
      department,
      instructor,
      year,
      semester,
      examType,
      description,
      status,
    } = req.body;

    // ── Find paper ──────────────────────────────────────────────
    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    // ── Validate and update status ──────────────────────────────
    if (status !== undefined) {
      const validStatuses = ["approved", "pending", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
      paper.status = status;
    }

    // ── Validate and update course ──────────────────────────────
    if (course !== undefined) {
      const courseExists = await Course.findOne({
        _id: course,
        isActive: true,
      });
      if (!courseExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive course",
        });
      }
      paper.course = course;
    }

    // ── Validate and update department ──────────────────────────
    if (department !== undefined) {
      const deptExists = await Department.findOne({
        _id: department,
        isActive: true,
      });
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive department",
        });
      }
      paper.department = department;
    }

    // ── Validate and update instructor ──────────────────────────
    if (instructor !== undefined) {
      const instructorExists = await Instructor.findOne({
        _id: instructor,
        isActive: true,
      });
      if (!instructorExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive instructor",
        });
      }
      paper.instructor = instructor;
    }

    // ── Update metadata fields ──────────────────────────────────
    if (year !== undefined) paper.year = year;
    if (semester !== undefined) paper.semester = semester;
    if (examType !== undefined) paper.examType = examType;
    if (description !== undefined) paper.description = description;

    // ── Save and populate ────────────────────────────────────────
    await paper.save();

    const populatedPaper = await Paper.findById(paper._id)
      .populate("course", "name")
      .populate("department", "name")
      .populate("instructor", "title name");

    return res.status(200).json({
      success: true,
      message: "Paper updated successfully",
      paper: populatedPaper,
    });
  } catch (error) {
    console.error("Admin update paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const adminDeletePaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    // ── Delete image files ──────────────────────────────────────
    if (paper.images && paper.images.length > 0) {
      for (const image of paper.images) {
        try {
          const filePath = image.path;
          if (filePath) {
            await fs.unlink(filePath);
          }
        } catch (unlinkError) {
          console.error(`Failed to delete file ${image.path}:`, unlinkError);
        }
      }
    }

    // ── Delete from database ─────────────────────────────────────
    await Paper.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Paper deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const adminBulkDeletePapers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of paper IDs",
      });
    }

    // ── Find papers to delete ────────────────────────────────────
    const papers = await Paper.find({ _id: { $in: ids } });

    // ── Delete image files ──────────────────────────────────────
    for (const paper of papers) {
      if (paper.images && paper.images.length > 0) {
        for (const image of paper.images) {
          try {
            const filePath = image.path;
            if (filePath) {
              await fs.unlink(filePath);
            }
          } catch (unlinkError) {
            console.error(`Failed to delete file ${image.path}:`, unlinkError);
          }
        }
      }
    }

    // ── Delete from database ─────────────────────────────────────
    const result = await Paper.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} paper(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Admin bulk delete papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete papers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
