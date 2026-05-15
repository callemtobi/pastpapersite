import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

// ROUTES
import authRoute from "./routes/auth.js";

// ------------------------------------MONGODB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on(
  "error",
  console.error.bind(console, "----------> Connection error...."),
);
mongoose.connection.once("open", () => {
  console.log("-------------> MongoDB connected...");
});

// ------------------------------------ CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  allowedHeader: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
  methods: ["Content-Type", "Authorization"],
};

// ------------------------------------ Middleware
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(corsOptions));

// ------------------------------------ Routes
app.use("/api/auth", authRoute);

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
app.use((req, res, next, err) => {
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
