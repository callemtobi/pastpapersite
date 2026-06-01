import Paper from "../models/Paper.js";
import imageHash from "image-hash";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Validation rules
 */
const VALIDATION_RULES = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 1 MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
};

const EXAM_KEYWORDS = [
  "question",
  "marks",
  "total marks",
  "time allowed",
  "semester",
  "midterm",
  "peshawar",
  "final term",
  "university",
  "course",
  "date",
  "department",
  "iqra",
  "national",
  "university",
  "iqra national university",
];

/**
 * Validate uploaded files
 * @param {Array} files - Array of file objects
 * @returns {Object} Validation result
 */
const validateUploadedFiles = (files) => {
  const errors = [];

  if (!files || files.length === 0) {
    return {
      valid: false,
      errors: ["No files provided"],
    };
  }

  if (files.length > VALIDATION_RULES.MAX_FILES) {
    errors.push(
      `Maximum ${VALIDATION_RULES.MAX_FILES} images allowed. Provided: ${files.length}`,
    );
  }

  files.forEach((file) => {
    // Check file type
    if (!VALIDATION_RULES.ALLOWED_TYPES.includes(file.mimetype)) {
      errors.push(
        `${file.originalname}: Invalid file type. Allowed: PNG, JPG, JPEG`,
      );
    }

    // Check file size
    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      errors.push(
        `${file.originalname}: File size must be ≤ 2 MB. Current: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate image hash using image-hash library
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} The image hash
 */
const calculateImageHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    imageHash.hash(filePath, 16, true, (error, data) => {
      if (error) {
        reject(
          new Error(
            `Failed to calculate hash for ${filePath}: ${error.message}`,
          ),
        );
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Calculate Hamming distance between two hashes
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} Hamming distance
 */
const hammingDistance = (hash1, hash2) => {
  if (hash1.length !== hash2.length) return -1;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
};

/**
 * Check if image is duplicate based on hash
 * @param {string} hash - Image hash
 * @param {Array} existingHashes - Array of existing hashes from database
 * @returns {Object} Duplicate check result
 */
const checkDuplicateImage = (hash, existingHashes = []) => {
  if (existingHashes.length === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  const distances = existingHashes.map((existing) =>
    hammingDistance(hash, existing),
  );
  const minDistance = Math.min(...distances);

  // If hamming distance is very small, consider it a duplicate
  // threshold: 8 bits out of 64 (about 87% similarity)
  const threshold = 8;
  return {
    isDuplicate: minDistance < threshold,
    similarity: ((64 - minDistance) / 64) * 100,
  };
};

/**
 * Detect exam keywords in image filename and metadata
 * @param {string} filename - The image filename
 * @returns {Object} Keyword detection result
 */
const detectExamKeywords = (filename) => {
  const lowerFilename = filename.toLowerCase();
  let score = 0;
  const detectedKeywords = [];

  EXAM_KEYWORDS.forEach((keyword) => {
    if (lowerFilename.includes(keyword)) {
      score += 1;
      detectedKeywords.push(keyword);
    }
  });

  // Normalize score to 0-1 range
  const normalizedScore = Math.min(score / EXAM_KEYWORDS.length, 1);

  return {
    score: normalizedScore,
    keywords: detectedKeywords,
  };
};

/**
 * Upload paper images
 * POST /api/papers/upload
 */
export const uploadPaper = async (req, res) => {
  try {
    const {
      title,
      courseCode,
      subject,
      year,
      semester,
      examType,
      description,
    } = req.body;
    const files = req.files;

    console.log(`File title: ${title}`);

    // Validate required fields
    if (!title || !courseCode || !subject || !year || !semester || !examType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate files
    const validation = validateUploadedFiles(files);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors,
      });
    }

    // Get existing hashes from database for duplicate detection
    const existingPapers = await Paper.find({}, "images.hash");
    const existingHashes = [];
    existingPapers.forEach((paper) => {
      if (paper.images && paper.images.length > 0) {
        paper.images.forEach((img) => {
          if (img.hash) existingHashes.push(img.hash);
        });
      }
    });

    // Process each file
    const imageData = [];
    const duplicateWarnings = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Calculate image hash
        const hash = await calculateImageHash(file.path);

        // Check for duplicates
        const duplicate = checkDuplicateImage(hash, existingHashes);
        if (duplicate.isDuplicate) {
          duplicateWarnings.push(
            `${file.originalname}: Similar to existing image (${duplicate.similarity.toFixed(1)}% match)`,
          );
        }

        // Detect keywords
        const keywords = detectExamKeywords(file.originalname);

        // Store image data
        imageData.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          hash,
          keywordScore: keywords.score,
          detectedKeywords: keywords.keywords,
          uploadedAt: new Date(),
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Clean up uploaded file on error
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error(`Failed to delete file ${file.path}:`, unlinkError);
        }
        throw error;
      }
    }

    // Warn about duplicates but continue (they might be intentional)
    if (duplicateWarnings.length > 0) {
      console.warn("Duplicate images detected:", duplicateWarnings);
    }

    // Create paper record
    const paper = await Paper.create({
      title,
      courseCode,
      subject,
      year,
      semester,
      examType,
      description,
      images: imageData,
      uploadedBy: req.user?.id || "anonymous", // Assumes middleware sets req.user
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${imageData.length} image(s)`,
      paper: {
        id: paper._id,
        title: paper.title,
        courseCode: paper.courseCode,
        imagesCount: paper.images.length,
        duplicateWarnings:
          duplicateWarnings.length > 0 ? duplicateWarnings : undefined,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get paper by ID
 * GET /api/papers/:id
 */
export const getPaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findById(id);
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
    console.error("Get paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all papers with pagination
 * GET /api/papers?page=1&limit=10&subject=Mathematics
 */
export const getPapers = async (req, res) => {
  try {
    const { page = 1, limit = 5, subject, examType, year } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (subject) filters.subject = subject;
    if (examType) filters.examType = examType;
    if (year) filters.year = year;

    const papers = await Paper.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-images.path") // Don't send file paths
      .sort({ createdAt: -1 });

    const total = await Paper.countDocuments(filters);

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
    console.error("Get papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete paper
 * DELETE /api/papers/:id
 */
export const deletePaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findByIdAndDelete(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    // Delete uploaded image files
    if (paper.images && paper.images.length > 0) {
      for (const image of paper.images) {
        try {
          await fs.unlink(image.path);
        } catch (error) {
          console.error(`Failed to delete file ${image.path}:`, error);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Paper deleted successfully",
    });
  } catch (error) {
    console.error("Delete paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  uploadPaper,
  getPaper,
  getPapers,
  deletePaper,
  validateUploadedFiles,
  calculateImageHash,
  detectExamKeywords,
  checkDuplicateImage,
};
