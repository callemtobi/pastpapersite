import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
  keywordScore: Number, // 0-1 score for exam-related keywords
  detectedKeywords: [String], // Array of detected keywords
  uploadedAt: Date,
});

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
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
  images: [imageSchema],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

export default mongoose.model("Paper", paperSchema);
