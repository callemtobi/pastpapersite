import express from "express";
import { getUsers } from "../controllers/authController";
import {
  getDashboardStats,
  getTopDownloadedPapers,
  getRecentActivity,
} from "../controllers/dasboardController";
import { deletePaper, updatePaper } from "../controllers/paperController";

const router = express.Router();

router.get("/", getUsers);

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/top-downloads", getTopDownloadedPapers);
router.get("/dashboard/recent-activity", getRecentActivity);

router.patch("/:id", updatePaper);

router.delete("/:id", deletePaper);
