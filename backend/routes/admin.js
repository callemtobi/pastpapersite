import express from "express";
import {
  adminGetUsers,
  adminGetUserById,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminBulkDeleteUsers,
  adminGetUserStats,
} from "../controllers/authController.js";
import {
  getDashboardStats,
  getRecentActivity,
  getTopDownloadedPapers,
} from "../controllers/dashboardController.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", adminGetUsers);
router.get("/users/stats", adminGetUserStats);
router.get("/users/:id", adminGetUserById);
router.get("/dashboard/stats", getDashboardStats);
// router.get("/dashboard/", getRecentActivity);
// router.get("/dashboard/", getTopDownloadedPapers);

router.post("/users", adminCreateUser);
router.patch("/users/:id", adminUpdateUser);

router.delete("/users/:id", adminDeleteUser);
router.delete("/users/bulk", adminBulkDeleteUsers);

// router.get("/users", authenticate, isAdmin, adminGetUsers);
// router.get("/users/stats", authenticate, isAdmin, adminGetUserStats);
// router.get("/users/:id", authenticate, isAdmin, adminGetUserById);
// router.get("/dashboard/stats", authenticate, isAdmin, getDashboardStats);

// router.post("/users", authenticate, isAdmin, adminCreateUser);
// router.patch("/users/:id", authenticate, isAdmin, adminUpdateUser);

// router.delete("/users/:id", authenticate, isAdmin, adminDeleteUser);
// router.delete("/users/bulk", authenticate, isAdmin, adminBulkDeleteUsers);

export default router;
