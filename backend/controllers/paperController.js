import Paper from "../models/Paper.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.js";
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

/**
 * Each pattern can optionally belong to a `group`.
 * Patterns WITHOUT a group are treated as independent signals — they all
 * count toward the achievable max, because a real paper could plausibly
 * contain all of them at once (e.g. "iqra national university" + "peshawar").
 *
 * Patterns WITH a group are mutually exclusive alternatives for the same
 * piece of information (e.g. two different header table styles, or three
 * different exam-type labels). Only ONE of them will ever be true for a
 * given paper, so only the single best-weighted pattern in that group is
 * counted toward the achievable max — not the sum of all of them.
 *
 * This is the actual root cause of the "clear image still scores low"
 * problem: the old code summed the weights of every pattern (including
 * mutually exclusive alternatives) into maxScore, making 100% mathematically
 * unreachable for any real paper (max achievable was ~460/575 ≈ 80%),
 * which meant the 50-point pass threshold was effectively much stricter
 * than it looked.
 */
const patterns = [
  // ── Institution name (high weight — strongest single signal) ──
  // [qg] handles the q→g OCR misread you already hit
  { regex: /i[qg]ra\s+national\s+university/i, weight: 50, strongSignal: true },
  {
    regex: /i[qg]ra\s+national\s+university\s*,?\s*peshawar/i,
    weight: 75,
    strongSignal: true,
  },
  { regex: /national\s+university/i, weight: 20 }, // fallback if "iqra" is badly mangled
  { regex: /peshawar/i, weight: 20 },

  // ── Header table fields (Image 1 style: Course Name / Max Marks / Max Time / Date / Instructor) ──
  { regex: /course\s*name/i, weight: 20, group: "header_style" },
  { regex: /max\s*marks/i, weight: 20, group: "header_style" },
  { regex: /max\s*time/i, weight: 15, group: "header_style" },
  { regex: /instructor/i, weight: 10, group: "header_style" },

  // ── Header block (Image 2 style: Faculty / Department / Marks: N) ──
  { regex: /faculty\s*[:.]?/i, weight: 15, group: "header_style" },
  { regex: /department\s+of\s+\w+/i, weight: 20, group: "header_style" },
  { regex: /marks\s*[:.]?\s*\d+/i, weight: 15, group: "header_style" },

  // ── Exam type / term (covers both "Mid-Term Examination Fall-2024" and "Mid Semester Spring-26") ──
  { regex: /mid[\s-]*term\s*examination/i, weight: 25, group: "exam_type" },
  { regex: /mid[\s-]*semester/i, weight: 25, group: "exam_type" },
  { regex: /final[\s-]*term/i, weight: 25, group: "exam_type" },
  { regex: /(fall|spring|summer)[\s-]*\d{2,4}/i, weight: 15 }, // term/year label, e.g. "Fall-2024", "Spring-26"

  // ── Instructions ──
  { regex: /attempt\s+all\s+questions/i, weight: 20, group: "instructions" },
  { regex: /answer\s+all\s+questions/i, weight: 20, group: "instructions" },
  {
    regex: /answer\s+the\s+following\s+questions/i,
    weight: 15,
    group: "instructions",
  },
  { regex: /read\s+the\s+questions\s+carefully/i, weight: 15 },
  { regex: /all\s+questions\s+are\s+compulsory/i, weight: 15 },

  // ── Question numbering styles seen in both papers ──
  { regex: /q\s*#?\s*\d+/i, weight: 15, group: "question_numbering" }, // "Q#1", "Q#2"
  { regex: /question\s*\d+/i, weight: 15, group: "question_numbering" },
  { regex: /fill\s+in\s+the\s+blanks/i, weight: 20 },
  { regex: /select\s+the\s+best\s+suited\s+response/i, weight: 15 },

  // ── Generic academic terms (lower weight, supporting signal only) ──
  { regex: /department.*i[qg]ra/i, weight: 20 },
  { regex: /(roll\s*no\.?|reg\.?\s*no\.?)\s*[:.]?\s*\w+/i, weight: 10 },
  { regex: /duration\s*[:.]?\s*\d/i, weight: 10, group: "time_limit" },
  { regex: /time\s+allowed/i, weight: 15, group: "time_limit" },
  { regex: /total\s+marks/i, weight: 15 },
];

// Sum of weights, but for grouped patterns only the single highest-weight
// pattern per group counts — that's the realistically achievable ceiling
// for one paper, instead of the sum of every mutually exclusive alternative.
const ACHIEVABLE_MAX_SCORE = (() => {
  const ungrouped = patterns.filter((p) => !p.group);
  const grouped = patterns.filter((p) => p.group);

  const ungroupedTotal = ungrouped.reduce((sum, p) => sum + p.weight, 0);

  const bestPerGroup = {};
  grouped.forEach((p) => {
    bestPerGroup[p.group] = Math.max(bestPerGroup[p.group] || 0, p.weight);
  });
  const groupedTotal = Object.values(bestPerGroup).reduce(
    (sum, w) => sum + w,
    0,
  );

  return ungroupedTotal + groupedTotal;
})();

// If the "Iqra National University" letterhead is confidently detected,
// that alone is strong proof this is a genuine paper from the institution —
// grade it high (floor of 90) even if other, more generic patterns (header
// table fields, instructions, question numbering, etc.) didn't happen to
// match well, e.g. due to a tight crop or a partially obscured page.
const computeNormalizedScore = (
  rawScore,
  maxScore,
  hasStrongInstitutionMatch,
) => {
  const base = Math.min(100, Math.round((rawScore / maxScore) * 100));
  return hasStrongInstitutionMatch ? Math.max(base, 90) : base;
};

const preprocessImage = async (inputBuffer) => {
  const metadata = await sharp(inputBuffer).metadata();
  const pipeline = sharp(inputBuffer)
    .grayscale()
    .normalize() // stretch contrast across the full range
    .sharpen({ sigma: 1 }); // gentler sharpen — aggressive default sharpening
  // can introduce ringing artifacts around text edges that hurt OCR on
  // already-crisp phone photos.

  if (metadata.width < 1200) {
    pipeline.resize({ width: 2000 }); // only upscale genuinely small images
  }

  return pipeline.toBuffer();
};

// Cleans up the OCR output before pattern matching. Previously this only
// fixed `|` → `i` and collapsed whitespace, so common Tesseract artifacts
// (curly quotes, en/em dashes, non-breaking spaces, stray control chars)
// were silently breaking pattern matches like "mid-term" or "fall-2024".
const normalizeOcrText = (text) =>
  text
    .toLowerCase()
    .replace(/[|]/g, "i") // common OCR misread
    .replace(/[\u2010-\u2015\u2212]/g, "-") // all dash variants → plain hyphen
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201c\u201d]/g, '"') // curly double quotes
    .replace(/[\u00a0\u2000-\u200b]/g, " ") // non-breaking / exotic spaces
    .replace(/[^\x20-\x7e\n]/g, "") // strip remaining non-printable junk
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

    const extractedText = normalizeOcrText(result.data.text);
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
          group: pattern.group || null,
          strongSignal: pattern.strongSignal || false,
        });
      }
    });

    const maxScore = ACHIEVABLE_MAX_SCORE;
    const hasStrongInstitutionMatch = matchedPatterns.some(
      (p) => p.strongSignal,
    );
    const normalizedScore = computeNormalizedScore(
      totalScore,
      maxScore,
      hasStrongInstitutionMatch,
    );
    console.log(
      `---------> Total pattern score: ${totalScore} / ${maxScore}, Normalized: ${normalizedScore}${hasStrongInstitutionMatch ? " (boosted — university letterhead detected)" : ""}`,
    );

    if (normalizedScore < 50) {
      console.warn(`Low OCR score detected for ${label}: ${normalizedScore}`);
    }

    return {
      success: true,
      extractedText,
      score: normalizedScore,
      rawScore: totalScore,
      confidence,
      maxScore,
      matchedPatterns,
      hasStrongInstitutionMatch,
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

const determineApprovalStatus = (
  confidence,
  rawScore,
  extractedText,
  maxScore,
  matchedPatterns = [],
  { skipScoreThreshold = false } = {},
) => {
  // This readability gate ALWAYS applies — even to a page that's inheriting
  // approval from an earlier page in the same upload, or one that matched
  // the university letterhead — so genuinely blank/corrupt images still
  // get caught.
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

  const hasStrongInstitutionMatch = matchedPatterns.some((p) => p.strongSignal);
  const normalizedScore = computeNormalizedScore(
    rawScore,
    maxScore,
    hasStrongInstitutionMatch,
  );

  if (hasStrongInstitutionMatch) {
    return {
      status: "approved",
      reason: `Iqra National University letterhead detected — graded high (${normalizedScore}/100)`,
      confidence,
      rawScore,
    };
  }

  // Later pages of a multi-page paper (question pages, answer sheets, etc.)
  // usually won't repeat the university name or instructor field that the
  // first page had — that's expected, not a sign of a bad scan. Once the
  // paper has already been verified via an earlier page, don't re-apply the
  // full pattern-score threshold to the rest; just confirm each page is
  // actually readable (handled by the gate above) and let it through.
  if (skipScoreThreshold) {
    return {
      status: "approved",
      reason:
        "Subsequent page of an already-verified paper — inherited approval",
      confidence,
      rawScore,
    };
  }

  // Threshold eased from 50 → 40. With the achievable-max fix above, scores
  // are no longer artificially deflated by unreachable mutually-exclusive
  // patterns, so 40 is a fairer bar for genuine exam papers while still
  // filtering out blank/irrelevant images.
  if (normalizedScore < 40) {
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

    // Once any page of this upload has been fully verified (via a genuine
    // pattern-score pass or a strong institution match), the rest of the
    // pages inherit that approval instead of being judged on their own
    // pattern score — a question page or answer sheet won't repeat the
    // university name / instructor field the first page had.
    let paperVerified = false;

    try {
      for (const file of req.files) {
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
          ocrResult.matchedPatterns,
          { skipScoreThreshold: paperVerified },
        );

        if (approvalStatus.status === "approved") {
          paperVerified = true;
        }

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
      .select(
        "-images.cloudinaryPublicId -images.ocrExtractedText -images.matchedPatterns -images.detectedKeywords -images.ocrScore -images.ocrConfidence -images.ocrRawScore -images.ocrMaxScore -images.verificationReason",
      );

    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found" });
    }

    return res.status(200).json({ success: true, paper });
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
        .select(
          "-images.cloudinaryPublicId -images.ocrExtractedText -images.matchedPatterns -images.detectedKeywords -images.ocrScore -images.ocrConfidence -images.ocrRawScore -images.ocrMaxScore -images.verificationReason",
        )
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

export const downloadPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const imageIndex = parseInt(req.query.imageIndex) || 0;

    const paper = await Paper.findById(id);
    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found" });
    }

    const image = paper.images[imageIndex];
    if (!image || !image.url) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    paper.downloads = (paper.downloads || 0) + 1;
    await paper.save();

    return res.redirect(image.url);
  } catch (error) {
    console.error("Download paper error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download paper",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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

export const getInitialData = async (req, res) => {
  try {
    console.log("Fetching initial data...");

    // Fetch all active courses with department populated
    const courses = await Course.find({ isActive: true })
      .populate("department", "name") // Populate department name
      .select("_id name department isActive")
      .limit(100)
      .sort({ name: 1 })
      .lean();

    // Fetch all active departments
    const departments = await Department.find({ isActive: true })
      .select("_id name isActive")
      .limit(100)
      .sort({ name: 1 })
      .lean();

    // Fetch all active instructors (no department field)
    const instructors = await Instructor.find({ isActive: true })
      .select("_id title name isActive")
      .limit(100)
      .sort({ name: 1 })
      .lean();

    console.log(
      `Found: ${courses.length} courses, ${departments.length} departments, ${instructors.length} instructors`,
    );

    return res.status(200).json({
      success: true,
      courses,
      departments,
      instructors,
    });
  } catch (error) {
    console.error("Get initial data error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch initial data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== SEARCH COURSES ====================
export const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        courses: [],
      });
    }

    const searchTerm = q.trim();
    const courses = await Course.find({
      name: { $regex: searchTerm, $options: "i" },
      isActive: true,
    })
      .populate("department", "name")
      .select("_id name department isActive")
      .limit(20)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Course search error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== SEARCH DEPARTMENTS ====================
export const searchDepartments = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        departments: [],
      });
    }

    const searchTerm = q.trim();
    const departments = await Department.find({
      name: { $regex: searchTerm, $options: "i" },
      isActive: true,
    })
      .select("_id name isActive")
      .limit(20)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Department search error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search departments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== SEARCH INSTRUCTORS ====================
export const searchInstructors = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        instructors: [],
      });
    }

    const searchTerm = q.trim();

    // Search by name or title
    const instructors = await Instructor.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { title: { $regex: searchTerm, $options: "i" } },
      ],
      isActive: true,
    })
      .select("_id title name isActive")
      .limit(20)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      instructors,
    });
  } catch (error) {
    console.error("Instructor search error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search instructors",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== GET COURSES BY DEPARTMENT ====================
export const getCoursesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const courses = await Course.find({
      department: departmentId,
      isActive: true,
    })
      .populate("department", "name")
      .select("_id name department isActive")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get courses by department error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== GET INSTRUCTORS (No department filter) ====================
export const getInstructorsByDepartment = async (req, res) => {
  try {
    // Since instructors don't have a department field, just return all active instructors
    const instructors = await Instructor.find({ isActive: true })
      .select("_id title name isActive")
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== GET INSTRUCTORS WITH NAME SEARCH ====================
export const searchInstructorsByName = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        instructors: [],
      });
    }

    const searchTerm = q.trim();
    const instructors = await Instructor.find({
      name: { $regex: searchTerm, $options: "i" },
      isActive: true,
    })
      .select("_id title name isActive")
      .limit(20)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      instructors,
    });
  } catch (error) {
    console.error("Search instructors by name error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search instructors",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
