import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadPaper,
  getPaperById,
  getPapers,
  downloadPaper,
  previewPaper,
  incrementDownload,
  getDepartments,
  getCourses,
  getInstructors,
  searchCourses,
  searchDepartments,
  searchInstructors,
  getInitialData,
  getCoursesByDepartment,
  getInstructorsByDepartment,
} from "../controllers/paperController.js";
import { authenticate } from "../middleware/auth.js";
import {
  getDashboardStats,
  getRecentActivity,
  getTopDownloadedPapers,
} from "../controllers/dashboardController.js";
import { getActiveAnnouncements } from "../controllers/announcementController.js";

const router = express.Router();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
    files: 5,
  },
});

// ==================== IMPORTANT: SPECIFIC ROUTES FIRST ====================
// These must come BEFORE any /:id routes

// ── Search routes (specific paths) ──────────────────────────────
router.get("/courses/search", searchCourses);
router.get("/departments/search", searchDepartments);
router.get("/instructors/search", searchInstructors);
router.get("/initial-data", getInitialData);
router.get("/departments/:departmentId/courses", getCoursesByDepartment);

// ── Dropdown data routes (public) ──────────────────────────────
router.get("/departments", getDepartments);
router.get("/courses", getCourses);
router.get("/instructors", getInstructors);

// ── Announcements ──────────────────────────────────────────────
router.get("/announcements/active", getActiveAnnouncements);

// ── Paper routes with params (MUST come after specific routes) ──
// These are the generic routes that should come LAST
router.get("/", getPapers); // This is fine - exact match
router.get("/:id", getPaperById);
router.get("/:id/download", downloadPaper);
router.get("/:id/preview", previewPaper);
router.put("/:id/increment-download", incrementDownload);

// ── Upload route ──────────────────────────────────────────────
router.post("/upload", authenticate, upload.array("images", 5), uploadPaper);

export default router;
