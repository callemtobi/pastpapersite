import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sir."],
    required: true,
  },
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Instructor", instructorSchema);
