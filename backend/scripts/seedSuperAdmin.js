// backend/scripts/seedSuperAdmin.js
import mongoose from "mongoose";
import argon2 from "argon2";
import User from "../models/User.js";
import dotenv from "dotenv";
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URI);

const hashedPassword = await argon2.hash("321");

await User.create({
  name: "Tobi Admin",
  email: "tobi659@gmail.com",
  studentId: 65965, // adjust to satisfy your schema's unique/required constraint
  department: "6a436208a9e235636b63aa86",
  password: hashedPassword,
  role: "super_admin",
  isVerified: true,
  isActive: true,
});

console.log("Super admin created");
process.exit(0);
