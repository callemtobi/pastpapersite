import express from "express";
import {
  adminGetUsers,
  adminGetUserById,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminBulkDeleteUsers,
  adminGetUserStats,
  // Department controllers
  adminGetDepartments,
  adminGetDepartmentById,
  adminCreateDepartment,
  adminUpdateDepartment,
  // Course controllers
  adminGetCourses,
  adminGetCourseById,
  adminCreateCourse,
  adminUpdateCourse,
  // Instructor controllers
  adminGetInstructors,
  adminGetInstructorById,
  adminCreateInstructor,
  adminUpdateInstructor,
  // Paper controllers
  adminGetPapers,
  adminGetPaperById,
  adminUpdatePaper,
  adminDeletePaper,
  adminBulkDeletePapers,
} from "../controllers/adminController.js";
import {
  getDashboardStats,
  getRecentActivity,
  getTopDownloadedPapers,
} from "../controllers/dashboardController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();
// ── All routes require authentication and admin role ────────────
// router.use(authenticate, isAdmin);
// router.use(authenticate, requireRole("admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent-activity", getRecentActivity);
router.get("/dashboard/top-downloads", getTopDownloadedPapers);

// ── User Routes ──────────────────────────────────────────────────
router.get("/users", adminGetUsers);
router.get("/users/stats", adminGetUserStats);
router.get("/users/:id", adminGetUserById);
router.post("/users", adminCreateUser);
router.patch("/users/:id", adminUpdateUser);
router.delete("/users/:id", adminDeleteUser);
router.delete("/users/bulk", adminBulkDeleteUsers);

// ── Department Routes ────────────────────────────────────────────
router.get("/departments", adminGetDepartments);
router.get("/departments/:id", adminGetDepartmentById);
router.post("/departments", adminCreateDepartment);
router.patch("/departments/:id", adminUpdateDepartment);

// ── Course Routes ────────────────────────────────────────────────
router.get("/courses", adminGetCourses);
router.get("/courses/:id", adminGetCourseById);
router.post("/courses", adminCreateCourse);
router.patch("/courses/:id", adminUpdateCourse);

// ── Instructor Routes ────────────────────────────────────────────
router.get("/instructors", adminGetInstructors);
router.get("/instructors/:id", adminGetInstructorById);
router.post("/instructors", adminCreateInstructor);
router.patch("/instructors/:id", adminUpdateInstructor);

// ── Paper Routes ──────────────────────────────────────────────────
router.get("/papers", adminGetPapers);
router.get("/papers/:id", adminGetPaperById);
router.patch("/papers/:id", adminUpdatePaper);
router.delete("/papers/:id", adminDeletePaper);
router.delete("/papers/bulk", adminBulkDeletePapers);

// ── Announcement Routes ──────────────────────────────────────────────────
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

// Authenticated routes
// router.get("/users", authenticate, isAdmin, adminGetUsers);
// router.get("/users/stats", authenticate, isAdmin, adminGetUserStats);
// router.get("/users/:id", authenticate, isAdmin, adminGetUserById);
// router.get("/dashboard/stats", authenticate, isAdmin, getDashboardStats);

// router.post("/users", authenticate, isAdmin, adminCreateUser);
// router.patch("/users/:id", authenticate, isAdmin, adminUpdateUser);

// router.delete("/users/:id", authenticate, isAdmin, adminDeleteUser);
// router.delete("/users/bulk", authenticate, isAdmin, adminBulkDeleteUsers);

export default router;
