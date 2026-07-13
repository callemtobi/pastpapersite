import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  url: String, // Cloudinary secure_url — was `path`
  cloudinaryPublicId: String, // new — needed for deletion
  // path: String,
  verificationStatus: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
  keywordScore: Number, // 0-1 score for exam-related keywords
  detectedKeywords: [String], // Array of detected keywords
  ocrExtractedText: String,
  ocrScore: Number,
  ocrRawScore: Number,
  ocrMaxScore: Number,
  matchedPatterns: [Object],
  uploadedAt: Date,
});

const paperSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    enum: ["Spring", "Fall", "Summer"],
    required: true,
  },
  examType: {
    type: String,
    enum: ["Midterm", "Final Exam"],
    required: true,
  },
  description: String,
  pages: { type: Number, default: 0 },
  images: [imageSchema],
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
  downloads: {
    type: Number,
    default: 0,
  },
  pages: {
    type: Number,
    default: 0,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verifiefBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  verifiefAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

paperSchema.index({ course: 1 });
paperSchema.index({ department: 1 });
paperSchema.index({ instructor: 1 });
paperSchema.index({ year: 1 });
paperSchema.index({ semester: 1 });
paperSchema.index({ examType: 1 });
paperSchema.index({ status: 1 });

export default mongoose.model("Paper", paperSchema);
