// backend/controllers/announcementController.js
import Announcement from "../models/Announcement.js";

// ── Get all announcements (Admin) ──────────────────────────────
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

// ── Get active announcements (Public) ──────────────────────────
export const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("Get active announcements error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

// ── Create announcement (Admin) ─────────────────────────────────
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, isActive } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

// ── Update announcement (Admin) ─────────────────────────────────
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isActive } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, isActive },
      { new: true, runValidators: true },
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

// ── Delete announcement (Admin) ─────────────────────────────────
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

export default {
  getAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
