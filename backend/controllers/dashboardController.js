// controllers/dashboardController.js
import Paper from "../models/Paper.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";
import fs from "fs";
import path from "path";
import cloudinary from "../services/cloudinary.js"; // your existing configured instance
import mongoose from "mongoose";

// ── Helper: Calculate total storage size ─────────────────────
async function calculateTotalStorageSize() {
  const papers = await Paper.find().select("images");
  let totalBytes = 0;

  for (const paper of papers) {
    for (const image of paper.images || []) {
      if (image.path) {
        const filePath = path.join(process.cwd(), image.path);
        try {
          const stats = fs.statSync(filePath);
          totalBytes += stats.size;
        } catch (err) {
          // File not found, skip
        }
      }
    }
  }

  return totalBytes;
}

// ── Helper: Get recent activity ───────────────────────────────
async function getRecentActivityFunc(limit = 10) {
  const activities = [];

  // Get recent uploads
  const recentUploads = await Paper.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("course createdAt");

  recentUploads.forEach((paper) => {
    activities.push({
      type: "upload",
      user: "Unknown User", // You can populate this with user info
      paper: `- ${paper.name}`,
      time: paper.createdAt,
    });
  });

  // Sort all activities by time
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  return activities.slice(0, limit);
}

export const getDashboardStats = async (req, res) => {
  try {
    // ── Parallel queries for performance ─────────────────────────
    const [
      totalPapers,
      totalUsers,
      departments,
      courses,
      totalDownloads,
      pendingPapers,
      rejectedPapers,
      monthlyUploads,
      monthlyDownloads,
      cloudinaryStorage, // replaces storageSize
      mongoStorage, // new
      topPapers,
      recentActivity,
    ] = await Promise.all([
      Paper.countDocuments(),
      User.countDocuments(),
      Department.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Paper.aggregate([
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      Paper.countDocuments({ status: "pending" }),
      Paper.countDocuments({ status: "rejected" }),
      Paper.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      Paper.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      getCloudinaryStorageUsage(),
      getMongoStorageUsage(),
      Paper.find()
        .sort({ downloads: -1 })
        .limit(5)
        .select("course downloads images"),
      getRecentActivityFunc(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPapers,
        totalUsers,
        totalDepartments: departments,
        totalCourses: courses,
        totalDownloads: totalDownloads[0]?.total || 0,
        pendingPapers,
        rejectedPapers,
        monthlyUploads,
        monthlyDownloads: monthlyDownloads[0]?.total || 0,
        storage: {
          cloudinary: cloudinaryStorage,
          mongodb: mongoStorage,
        },
        topPapers,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

async function getCloudinaryStorageUsage() {
  try {
    const usage = await cloudinary.api.usage();
    return {
      bytesUsed: usage.storage.usage, // total bytes stored
      bytesLimit: usage.storage.limit ?? null, // plan limit, if applicable
      credits: usage.credits?.usage ?? null,
    };
  } catch (err) {
    console.error("Cloudinary usage fetch error:", err);
    return { bytesUsed: 0, bytesLimit: null, credits: null };
  }
}

async function getMongoStorageUsage() {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      dataSize: stats.dataSize, // actual document data, bytes
      storageSize: stats.storageSize, // allocated disk storage, bytes (includes overhead)
      indexSize: stats.indexSize, // bytes used by indexes
      totalSize: stats.dataSize + stats.indexSize,
    };
  } catch (err) {
    console.error("MongoDB stats fetch error:", err);
    return { dataSize: 0, storageSize: 0, indexSize: 0, totalSize: 0 };
  }
}

export const getTopDownloadedPapers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topPapers = await Paper.find()
      .populate({
        path: "course",
        populate: {
          path: "department",
        },
      })
      .sort({ downloads: -1 })
      .limit(limit)
      .select("course downloads pages createdAt");

    return res.status(200).json({
      success: true,
      data: topPapers,
    });
  } catch (error) {
    console.error("Top papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top downloaded papers",
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const activities = [];

    // ── Get recent uploads ──
    const recentUploads = await Paper.find()
      .populate({ path: "course", select: "name" })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 3))
      .select("course createdAt uploadedBy");

    recentUploads.forEach((paper) => {
      activities.push({
        type: "upload",
        user: paper.uploadedBy || "Anonymous",
        paper: paper.course?.name || "Unknown Course",
        time: paper.createdAt,
        id: paper._id,
      });
    });

    // ── Get recent status changes ──
    const recentStatusChanges = await Paper.find()
      .populate({ path: "course", select: "name" })
      .sort({ updatedAt: -1 })
      .limit(Math.ceil(limit / 3))
      .select("status updatedAt");

    recentStatusChanges.forEach((paper) => {
      activities.push({
        type: paper.status === "approved" ? "approval" : "rejection",
        user: "Admin",
        paper: paper.course?.name || "Unknown Course",
        time: paper.updatedAt,
        id: paper._id,
      });
    });

    // ── Get recent downloads ──
    const recentDownloads = await Paper.find()
      .populate({ path: "course", select: "name" })
      .sort({ updatedAt: -1 })
      .limit(Math.ceil(limit / 3))
      .select("downloads updatedAt");

    recentDownloads.forEach((paper) => {
      activities.push({
        type: "download",
        user: "User",
        paper: paper.course?.name || "Unknown Course",
        time: paper.updatedAt,
        id: paper._id,
      });
    });

    // ── Sort and return ──
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    return res.status(200).json({
      success: true,
      data: activities.slice(0, limit),
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
    });
  }
};
