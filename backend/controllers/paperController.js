import Paper from "../models/Paper.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

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

const patterns = [
  // ── Institution name (high weight — strongest single signal) ──
  // [qg] handles the q→g OCR misread you already hit
  { regex: /i[qg]ra\s+national\s+university/i, weight: 50 },
  { regex: /i[qg]ra\s+national\s+university\s*,?\s*peshawar/i, weight: 75 },
  { regex: /national\s+university/i, weight: 15 }, // fallback if "iqra" is badly mangled
  { regex: /peshawar/i, weight: 10 },

  // ── Header table fields (Image 1 style: Course Name / Max Marks / Max Time / Date / Instructor) ──
  { regex: /course\s*name/i, weight: 20 },
  { regex: /max\s*marks/i, weight: 20 },
  { regex: /max\s*time/i, weight: 15 },
  { regex: /instructor/i, weight: 10 },

  // ── Header block (Image 2 style: Faculty / Department / Marks: N) ──
  { regex: /faculty\s*[:.]?/i, weight: 15 },
  { regex: /department\s+of\s+\w+/i, weight: 20 },
  { regex: /marks\s*[:.]?\s*\d+/i, weight: 15 },

  // ── Exam type / term (covers both "Mid-Term Examination Fall-2024" and "Mid Semester Spring-26") ──
  { regex: /mid[\s-]*term\s*examination/i, weight: 25 },
  { regex: /mid[\s-]*semester/i, weight: 25 },
  { regex: /final[\s-]*term/i, weight: 25 },
  { regex: /(fall|spring|summer)[\s-]*\d{2,4}/i, weight: 15 }, // term/year label, e.g. "Fall-2024", "Spring-26"

  // ── Instructions ──
  { regex: /attempt\s+all\s+questions/i, weight: 20 },
  { regex: /answer\s+all\s+questions/i, weight: 20 },
  { regex: /answer\s+the\s+following\s+questions/i, weight: 15 },
  { regex: /read\s+the\s+questions\s+carefully/i, weight: 15 },
  { regex: /all\s+questions\s+are\s+compulsory/i, weight: 15 },

  // ── Question numbering styles seen in both papers ──
  { regex: /q\s*#?\s*\d+/i, weight: 15 }, // "Q#1", "Q#2"
  { regex: /question\s*\d+/i, weight: 15 },
  { regex: /fill\s+in\s+the\s+blanks/i, weight: 20 },
  { regex: /select\s+the\s+best\s+suited\s+response/i, weight: 15 },

  // ── Generic academic terms (lower weight, supporting signal only) ──
  { regex: /department.*i[qg]ra/i, weight: 20 },
  { regex: /(roll\s*no\.?|reg\.?\s*no\.?)\s*[:.]?\s*\w+/i, weight: 10 },
  { regex: /duration\s*[:.]?\s*\d/i, weight: 10 },
  { regex: /time\s+allowed/i, weight: 15 },
  { regex: /total\s+marks/i, weight: 15 },
];

const preprocessImage = async (inputBuffer) => {
  const metadata = await sharp(inputBuffer).metadata();
  const pipeline = sharp(inputBuffer).grayscale().normalize().sharpen();

  if (metadata.width < 1200) {
    pipeline.resize({ width: 2000 }); // only upscale genuinely small images
  }

  return pipeline.toBuffer();

  // const outputPath = inputPath.replace(/(\.\w+)$/, "-processed$1");
  // await sharp(inputPath)
  //   .resize({ width: 2000, withoutEnlargement: false }) // upscale small phone photos
  //   .grayscale()
  //   .normalize() // stretch contrast
  //   .sharpen()
  //   .toBuffer();
  //   // .toFile(outputPath); // processed file is stored in buffer rather than on disk
  // return outputPath;
};

const normalizeOcrText = (text) =>
  text
    .toLowerCase()
    .replace(/[|]/g, "i") // common OCR misread
    .replace(/\s+/g, " ") // collapse whitespace/newlines
    .trim();

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

const extractAndScoreText = async (fileBuffer, worker, label) => {
  try {
    console.log(`Starting OCR on: ${label}`);

    const processedBuffer = await preprocessImage(fileBuffer);
    const result = await worker.recognize(processedBuffer);

    const confidence = result.data.confidence;
    console.log(`---------> OCR confidence: ${confidence}`);

    const extractedText = normalizeOcrText(result.data.text.toLowerCase());
    console.log(
      `OCR extraction complete. Text length: ${extractedText.length}`,
    );

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

    const maxScore = patterns.reduce((sum, p) => sum + p.weight, 0);
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
    console.error(`OCR extraction failed for ${label}:`, error);
    return {
      success: false,
      error: error.message,
      score: 0,
      rawScore: 0,
      confidence: 0,
      maxScore: 0,
      extractedText: "",
      matchedPatterns: [],
    };
  }
  // no finally/cleanup needed — nothing was written to disk
};

//  * - OCR Confidence < 20 → Rejected
//  * - OCR Confidence < 50 → Pending Review
//  * - OCR Confidence > 50 → Approved
const determineApprovalStatus = (
  confidence,
  rawScore,
  extractedText,
  maxScore,
  matchedPatterns,
) => {
  if (
    confidence < 20 ||
    !extractedText ||
    extractedText.trim().length < 15
    // matchedPatterns.length === 0
  ) {
    return {
      status: "rejected",
      reason:
        "Image unreadable or does not contain any recognizable exam-related content",
      confidence,
      rawScore,
    };
  }

  const normalizedScore = Math.round((rawScore / maxScore) * 100);

  if (normalizedScore < 50) {
    return {
      status: "pending",
      reason: `Score ${normalizedScore}/100 below auto-approval threshold — sent for admin review`,
      confidence,
      rawScore,
    };
  }

  return {
    status: "approved",
    reason: `Score ${normalizedScore}/100 meets auto-approval threshold`,
    confidence,
    rawScore,
  };
};

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
    const validation = validateUploadedFiles(req.files);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors,
      });
    }

    // ── Process each file ──────────────────────────────────────
    const imageData = [];
    const worker = await createWorker("eng", 1, { langPath: "./" });
    await worker.setParameters({ tessedit_pageseg_mode: "6" });

    try {
      for (const file of req.files) {
        // const ocrResult = await extractAndScoreText(file.path, worker);
        const ocrResult = await extractAndScoreText(
          file.buffer,
          worker,
          file.originalname,
        );

        console.log(
          `OCR Score: ${ocrResult.score}, Confidence: ${ocrResult.confidence}, Matched Patterns:`,
          ocrResult.matchedPatterns,
        );

        const approvalStatus = determineApprovalStatus(
          ocrResult.confidence,
          ocrResult.rawScore,
          ocrResult.extractedText,
          ocrResult.maxScore,
          // ocrResult.matchedPatterns,
        );

        if (approvalStatus.status === "rejected") {
          // Don't bother uploading a rejected image to Cloudinary at all
          continue; // handled by rejectedImages check below via a parallel tracking array
        }

        const { url, publicId } = await uploadBufferToCloudinary(
          file.buffer,
          "papers",
        );
        console.log(
          `------> Status: ${approvalStatus.status}, Reason: ${approvalStatus.reason}`,
        );

        imageData.push({
          filename: publicId,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url, // Cloudinary secure URL — this is what the frontend renders
          cloudinaryPublicId: publicId, // needed for later deletion
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
        // } catch (error) {
        //   console.error(`Error processing file ${file.originalname}:`, error);
        //   try {
        //     await fs.unlink(file.path);
        //   } catch (unlinkError) {
        //     console.error(`Failed to delete file ${file.path}:`, unlinkError);
        //   }
        //   throw error;
        // }
      }
    } finally {
      await worker.terminate();
    }

    // If ANY file was outright rejected, fail the whole upload — mirrors your original behavior,
    // but now there's nothing to fs.unlink since rejected files were never uploaded to Cloudinary
    if (imageData.length < req.files.length) {
      // clean up whatever DID get uploaded before the rejection, so nothing orphaned remains
      await Promise.all(
        imageData.map((img) => deleteFromCloudinary(img.cloudinaryPublicId)),
      );
      return res.status(400).json({
        success: false,
        message:
          "Upload rejected! One or more images did not meet quality requirements.",
      });
    }

    const hasPendingReview = imageData.some(
      (img) => img.verificationStatus === "pending",
    );

    const paper = await Paper.create({
      course,
      department,
      instructor,
      year,
      semester,
      examType,
      description: description || "",
      pages: imageData.length,
      images: imageData,
      status: hasPendingReview ? "pending" : "approved",
      uploadedBy: req.user?.id || null,
      createdAt: new Date(),
    });

    // // ── Check for rejected images ──────────────────────────────
    // const rejectedImages = imageData.filter(
    //   (img) => img.verificationStatus === "rejected",
    // );

    // if (rejectedImages.length > 0) {
    //   for (const img of imageData) {
    //     try {
    //       const filePath = path.join(
    //         process.cwd(),
    //         img.path.replace(/^\/uploads\//, "uploads/"),
    //       );
    //       await fs.unlink(filePath);
    //     } catch (unlinkError) {
    //       console.error(`Failed to delete file ${img.path}:`, unlinkError);
    //     }
    //   }

    //   const rejectionReasons = rejectedImages
    //     .map((img) => `${img.originalName}: ${img.verificationReason}`)
    //     .join("; ");

    //   console.warn(
    //     `Upload rejected due to low OCR confidence: ${rejectionReasons}`,
    //   );

    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Your upload was rejected because one or more images were not clear enough for accurate text recognition. Please upload clearer, high-quality images and try again.",
    //     rejectedImages: rejectedImages.map((img) => ({
    //       originalName: img.originalName,
    //       reason: img.verificationReason,
    //     })),
    //   });
    // }

    // ── Create paper record ─────────────────────────────────────
    // Changed: removed instructor.title/name, using ObjectId reference
    // const paperData = {
    //   course, // Now storing ObjectId reference
    //   department, // Now storing ObjectId reference
    //   instructor, // Now storing ObjectId reference
    //   year,
    //   semester,
    //   examType,
    //   description: description || "",
    //   pages: imageData.length,
    //   images: imageData,
    //   status: hasPendingReview ? "pending" : "approved",
    //   uploadedBy: req.user?.id || null,
    //   createdAt: new Date(),
    // };

    // const paper = await Paper.create(paperData);

    return res.status(201).json({
      success: true,
      message:
        paper.status === "approved"
          ? "Your paper has been approved and is now live. It is available for all users to view and download."
          : "Your paper has been submitted and is awaiting admin verification. You'll be notified once a decision has been made.",
      paper: { id: paper._id, course: paper.course, status: paper.status },
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

    const filters = { status: "approved" }; // ← always enforced, not client-controlled

    if (examType) filters.examType = examType;
    if (year) filters.year = year;
    if (semester) filters.semester = semester;

    if (department) {
      if (mongoose.Types.ObjectId.isValid(department)) {
        filters.department = department;
      } else {
        const dept = await Department.findOne({
          name: { $regex: department, $options: "i" },
        });
        if (dept) filters.department = dept._id;
      }
    }

    let searchFilter = {};
    if (search) {
      const [matchingCourses, matchingDepartments, matchingInstructors] =
        await Promise.all([
          Course.find({ name: { $regex: search, $options: "i" } }).select(
            "_id",
          ),
          Department.find({ name: { $regex: search, $options: "i" } }).select(
            "_id",
          ),
          Instructor.find({ name: { $regex: search, $options: "i" } }).select(
            "_id",
          ),
        ]);
      searchFilter = {
        $or: [
          { course: { $in: matchingCourses.map((c) => c._id) } },
          { department: { $in: matchingDepartments.map((d) => d._id) } },
          { instructor: { $in: matchingInstructors.map((i) => i._id) } },
        ],
      };
    }

    const finalFilters = { ...filters, ...searchFilter };

    const [papers, total] = await Promise.all([
      Paper.find(finalFilters)
        .populate("course", "name")
        .populate("department", "name")
        .populate("instructor", "title name")
        .select("-images.path")
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

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select("name")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

// ── Get courses for dropdown ─────────────────────────────────────
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate("department", "name")
      .select("name department")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

// ── Get instructors for dropdown ─────────────────────────────────
export const getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find({ isActive: true })
      .select("title name")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      instructors,
    });
  } catch (error) {
    console.error("Get instructors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructors",
    });
  }
};
