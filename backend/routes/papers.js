import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadPaper,
  getPaper,
  getPapers,
  deletePaper,
} from "../controllers/paperController.js";

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

/**
 * Upload paper with multiple images
 * POST /api/papers/upload
 * Body: form-data with:
 *   - title (string)
 *   - courseCode (string)
 *   - subject (string)
 *   - year (string)
 *   - semester (string)
 *   - examType (string)
 *   - description (string, optional)
 *   - images (file[], multiple)
 */
router.post("/upload", upload.array("images", 5), uploadPaper);

/**
 * Get all papers with pagination and filters
 * GET /api/papers?page=1&limit=10&subject=Math&examType=Final&year=2024
 */
router.get("/", getPapers);

/**
 * Get single paper by ID
 * GET /api/papers/:id
 */
router.get("/:id", getPaper);

/**
 * Delete paper by ID
 * DELETE /api/papers/:id
 */
router.delete("/:id", deletePaper);

export default router;
