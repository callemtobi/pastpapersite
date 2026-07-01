import Paper from "../models/Paper.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import Tesseract from "tesseract.js";

/**
 * Validation rules
 */
const VALIDATION_RULES = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2 MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
};

// const EXAM_KEYWORDS = [
//   "question",
//   "marks",
//   "total marks",
//   "time allowed",
//   "semester",
//   "midterm",
//   "peshawar",
//   "final term",
//   "university",
//   "course",
//   "date",
//   "department",
//   "iqra",
//   "national",
//   "university",
//   "iqra national university",
// ];

/**
 * Weighted pattern scoring system for exam paper detection
 */
const patterns = [
  // Generic exam patterns
  { regex: /question\s*\d+/i, weight: 20 },
  { regex: /q\.?\s*\d+/i, weight: 20 },
  { regex: /answer\s+all\s+questions/i, weight: 25 },
  { regex: /time\s+allowed/i, weight: 20 },
  { regex: /total\s+marks/i, weight: 20 },
  // IQRA National University patterns
  {
    regex: /iqra\s+national\s+university/i,
    weight: 50,
  },
  {
    regex: /iqra\s+national\s+university\s*,?\s*peshawar/i,
    weight: 75,
  },
  {
    regex: /peshawar/i,
    weight: 10,
  },
  {
    regex: /(midterm|final\s*term|final\s*exam)/i,
    weight: 20,
  },
  {
    regex: /department.*iqra/i,
    weight: 20,
  },
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
 * Extract text from image using OCR and score with weighted patterns
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} OCR result with text and weighted score
 */
const extractAndScoreText = async (imagePath) => {
  try {
    console.log(`Starting OCR on: ${imagePath}`);

    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const confidence = result.data.confidence;
    console.log(`---------> OCR confidence: ${confidence}`);
    const extractedText = result.data.text.toLowerCase();
    console.log(
      `OCR extraction complete. Text length: ${extractedText.length}`,
    );

    // Calculate weighted pattern score
    let totalScore = 0;
    let matchedPatterns = [];

    patterns.forEach((pattern) => {
      const matches = extractedText.match(pattern.regex);
      if (matches && matches.length > 0) {
        totalScore += pattern.weight;
        matchedPatterns.push({
          pattern: pattern.regex.source,
          matches: matches.length,
          weight: pattern.weight,
        });
      }
    });

    // Normalize score: max possible is sum of all weights
    const maxScore = patterns.reduce((sum, p) => sum + p.weight, 0);
    // const normalizedScore = Math.min(totalScore / maxScore, 1);
    const normalizedScore = Math.round((totalScore / maxScore) * 100);
    console.log(
      `---------> Total pattern score: ${totalScore} / ${maxScore}, Normalized: ${normalizedScore}`,
    );

    if (normalizedScore < 50) {
      console.warn(
        `Low OCR score detected for ${imagePath}: ${normalizedScore}`,
      );
    }

    return {
      success: true,
      extractedText,
      score: normalizedScore,
      rawScore: totalScore,
      confidence,
      maxScore,
      matchedPatterns,
    };
  } catch (error) {
    console.error(`OCR extraction failed for ${imagePath}:`, error);
    return {
      success: false,
      error: error.message,
      score: 0,
      extractedText: "",
      matchedPatterns: [],
    };
  }
};

/**
 * Determine approval status based on OCR confidence and raw pattern score
 * Logic:
 * - OCR Confidence < 50 → Rejected
 * - OCR Confidence ≥ 50 AND Raw Score < 100 → Pending Review
 * - OCR Confidence ≥ 50 AND Raw Score ≥ 100 → Approved
 * @param {number} confidence - OCR confidence percentage (0-100)
 * @param {number} rawScore - Raw pattern matching score
 * @returns {Object} Approval status with reason
 */
const determineApprovalStatus = (confidence, rawScore) => {
  if (confidence < 50) {
    return {
      status: "rejected",
      reason: `OCR confidence too low: ${confidence}% (threshold: 50%)`,
      confidence,
      rawScore,
    };
  }

  if (rawScore < 100) {
    return {
      status: "pending",
      reason: `Raw score below approval threshold: ${rawScore} (threshold: 100)`,
      confidence,
      rawScore,
    };
  }

  return {
    status: "approved",
    reason: `OCR confidence ${confidence}% and raw score ${rawScore} meet approval criteria`,
    confidence,
    rawScore,
  };
};

/**
 * Detect exam keywords in image filename and metadata
 * @param {string} filename - The image filename
 * @returns {Object} Keyword detection result
 */
// const detectExamKeywords = (filename) => {
//   const lowerFilename = filename.toLowerCase();
//   let score = 0;
//   const detectedKeywords = [];

//   EXAM_KEYWORDS.forEach((keyword) => {
//     if (lowerFilename.includes(keyword)) {
//       score += 1;
//       detectedKeywords.push(keyword);
//     }
//   });

//   // Normalize score to 0-1 range
//   const normalizedScore = Math.min(score / EXAM_KEYWORDS.length, 1);

//   return {
//     score: normalizedScore,
//     keywords: detectedKeywords,
//   };
// };

/**
 * Upload paper images
 * POST /api/papers/upload
 */
export const uploadPaper = async (req, res) => {
  try {
    const {
      course, // Changed from 'name' to 'course' (ObjectId)
      department,
      instructor,
      year,
      semester,
      examType,
      description,
    } = req.body;
    const files = req.files;

    // ── Validate required fields ──────────────────────────────
    // Changed: 'name' → 'course'
    if (
      !course ||
      !year ||
      !department ||
      !instructor ||
      !semester ||
      !examType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: course, year, department, instructor, semester, examType",
      });
    }

    // ── Validate that references exist ─────────────────────────
    const [courseExists, deptExists, instructorExists] = await Promise.all([
      Course.findOne({ _id: course, isActive: true }),
      Department.findOne({ _id: department, isActive: true }),
      Instructor.findOne({ _id: instructor, isActive: true }),
    ]);

    if (!courseExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive course selected",
      });
    }

    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive department selected",
      });
    }

    if (!instructorExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive instructor selected",
      });
    }

    // ── Validate files ──────────────────────────────────────────
    const validation = validateUploadedFiles(files);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors,
      });
    }

    // ── Process each file ──────────────────────────────────────
    const imageData = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const ocrResult = await extractAndScoreText(file.path);
        console.log(
          `OCR Score: ${ocrResult.score}, Confidence: ${ocrResult.confidence}, Matched Patterns:`,
          ocrResult.matchedPatterns,
        );

        const approvalStatus = determineApprovalStatus(
          ocrResult.confidence,
          ocrResult.rawScore,
        );
        console.log(
          `Status: ${approvalStatus.status}, Reason: ${approvalStatus.reason}`,
        );

        imageData.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          verificationStatus: approvalStatus.status,
          verificationReason: approvalStatus.reason,
          detectedKeywords: ocrResult.matchedPatterns.map((p) => p.pattern),
          ocrExtractedText: ocrResult.extractedText,
          ocrScore: ocrResult.score,
          ocrConfidence: ocrResult.confidence,
          ocrRawScore: ocrResult.rawScore,
          ocrMaxScore: ocrResult.maxScore,
          matchedPatterns: ocrResult.matchedPatterns,
          uploadedAt: new Date(),
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error(`Failed to delete file ${file.path}:`, unlinkError);
        }
        throw error;
      }
    }

    // ── Check for rejected images ──────────────────────────────
    const rejectedImages = imageData.filter(
      (img) => img.verificationStatus === "rejected",
    );
    if (rejectedImages.length > 0) {
      for (const img of imageData) {
        try {
          await fs.unlink(img.path);
        } catch (unlinkError) {
          console.error(`Failed to delete file ${img.path}:`, unlinkError);
        }
      }

      const rejectionReasons = rejectedImages
        .map((img) => `${img.originalName}: ${img.verificationReason}`)
        .join("; ");

      console.warn(
        `Upload rejected due to low OCR confidence: ${rejectionReasons}`,
      );

      return res.status(400).json({
        success: false,
        message:
          "Upload rejected! One or more images have insufficient OCR confidence",
        rejectedImages: rejectedImages.map((img) => ({
          originalName: img.originalName,
          reason: img.verificationReason,
        })),
      });
    }

    const hasPendingReview = imageData.some(
      (img) => img.verificationStatus === "pending",
    );

    // ── Create paper record ─────────────────────────────────────
    // Changed: removed instructor.title/name, using ObjectId reference
    const paperData = {
      course, // Now storing ObjectId reference
      department, // Now storing ObjectId reference
      instructor, // Now storing ObjectId reference
      year,
      semester,
      examType,
      description: description || "",
      pages: imageData.length,
      images: imageData,
      status: hasPendingReview ? "pending" : "approved",
      uploadedBy: req.user?.id || null,
      createdAt: new Date(),
    };

    const paper = await Paper.create(paperData);

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${imageData.length} image(s)`,
      paper: {
        id: paper._id,
        course: paper.course,
        imagesCount: paper.images.length,
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
export const getPaperById = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findById(id)
      .populate("course", "name")
      .populate("department", "name")
      .populate("instructor", "title name")
      .select("-images.path");

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
    const {
      page = 1,
      limit = 10,
      search = "",
      department = "",
      examType = "",
      year = "",
      semester = "",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ── Build filters ───────────────────────────────────────────
    const filters = {};

    // Only add filters if they have values
    if (examType) filters.examType = examType;
    if (year) filters.year = year;
    if (semester) filters.semester = semester;

    // Department filter (by ObjectId or name)
    if (department) {
      // If department is a valid ObjectId, use it directly
      if (mongoose.Types.ObjectId.isValid(department)) {
        filters.department = department;
      } else {
        // If it's a name, find the department first
        const dept = await Department.findOne({
          name: { $regex: department, $options: "i" },
        });
        if (dept) filters.department = dept._id;
      }
    }

    // ── Search across populated fields ──────────────────────────
    let searchFilter = {};
    if (search) {
      // First, find matching courses, departments, instructors
      const matchingCourses = await Course.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const matchingDepartments = await Department.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const matchingInstructors = await Instructor.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      searchFilter = {
        $or: [
          { course: { $in: matchingCourses.map((c) => c._id) } },
          { department: { $in: matchingDepartments.map((d) => d._id) } },
          { instructor: { $in: matchingInstructors.map((i) => i._id) } },
        ],
      };
    }

    // ── Combine filters ──────────────────────────────────────────
    const finalFilters = { ...filters, ...searchFilter };

    // ── Query with populate ──────────────────────────────────────
    const [papers, total] = await Promise.all([
      Paper.find(finalFilters)
        .populate("course", "name") // Get course name
        .populate("department", "name") // Get department name
        .populate("instructor", "title name") // Get instructor title & name
        .select("-images.path") // Exclude file paths
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Paper.countDocuments(finalFilters),
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
    console.error("Get papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// download paper
export const downloadPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const imageIndex = parseInt(req.query.imageIndex) || 0; // read index

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found",
      });
    }

    const image = paper.images[imageIndex]; // use the correct image
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    // Assuming the paper has a file path stored
    const uploadPath = image.path;
    const filePath = path.join(
      process.cwd(),
      uploadPath.replace(/^\/uploads\//, "uploads/"),
    );

    // Check if file path exists
    // if (!fs.existsSync(filePath)) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "File not found on disk" });
    // }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: "Paper file not found",
      });
    }

    return res.status(200).sendFile(filePath);
  } catch (error) {
    console.error("Download paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// preview paper
export const previewPaper = async (req, res) => {
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
    console.log(`Viewing paper: ${paper.course?.name || "Unknown Course"}`);
    return res.status(200).json({
      success: true,
      paper,
    });
  } catch (error) {
    console.error("Preview paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to preview paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { returnDocument: true },
    );

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    res.json({
      message: "Download count updated",
      downloads: paper.downloads,
    });
  } catch (error) {
    console.error("Download increment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
