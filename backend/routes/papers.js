import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadPaper,
  getPaperById,
  getPapers,
  deletePaper,
  downloadPaper,
  previewPaper,
  incrementDownload,
  updatePaper,
} from "../controllers/paperController.js";
import { authenticate } from "../middleware/auth.js";
import {
  getDashboardStats,
  getRecentActivity,
  getTopDownloadedPapers,
} from "../controllers/dashboardController.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp_random_originalname
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${timestamp}_${random}_${name}${ext}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 1 MB
    files: 5,
  },
});

router.get("/", getPapers);
router.get("/:id", getPaperById);
router.get("/:id/download", downloadPaper);
router.get("/:id/preview", previewPaper);

router.post("/upload", authenticate, upload.array("images", 5), uploadPaper);
router.put("/:id/increment-download", incrementDownload);

router.delete("/:id", authenticate, deletePaper);

export default router;
