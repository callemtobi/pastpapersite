import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Data Structures"
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index: same course code shouldn't appear twice in same department
// courseSchema.index({ code: 1, department: 1 }, { unique: true });

export default mongoose.model("Course", courseSchema);
