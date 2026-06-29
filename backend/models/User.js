import mongoose from "mongoose";

const userRoles = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    studentId: {
      type: Number,
      unique: true,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    resetToken: String,
    resetTokenExpiresAt: Date,
    resetTokenIssuedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  },
);

// ── Indexing for performance ──────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model("User", userSchema);
export default User;
export { userRoles };
