import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { startCleanupCron } from "./utils/cleanupCron.js";

// ROUTES
import authRoute from "./routes/auth.js";
import papersRoute from "./routes/papers.js";
import adminRoute from "./routes/admin.js";

// ------------------------------------MONGODB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    startCleanupCron(); // 👈 start after DB is ready
  })
  .catch((err) => {
    console.error("❌ Initial MongoDB connection failed:", err);
    process.exit(1); // or retry logic
  });
mongoose.connection.on(
  "error",
  console.error.bind(console, "----------> Connection error...."),
);
mongoose.connection.once("open", () => {
  console.log("-------------> MongoDB connected...");
});

// ------------------------------------ CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ------------------------------------ Middleware
const app = express();
const PORT = process.env.PORT || 8000;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------ Routes
app.use("/api/auth", authRoute);
app.use("/api/papers", papersRoute);
app.use("/api/admin", adminRoute);

// ------------------------------------ Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "-----------> Server is healthy...",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------ 404 error
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "----------> Route not found...",
  });
});

// ------------------------------------ Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "-----------> Something went wrong....",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ------------------------------------ PORT
app.listen(PORT, () => {
  console.log(`---> 🚀 Server running on port ${PORT}`);
  console.log(`---> 🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
