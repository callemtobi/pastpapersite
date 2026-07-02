// app/admin/announcements/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
  });

  // ── Fetch announcements ────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/admin/announcements",
        { withCredentials: true },
      );
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to fetch announcements",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial fetch ──────────────────────────────────────────────
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ── Reset form ─────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ title: "", content: "", isActive: true });
    setEditingAnnouncement(null);
  };

  // ── Handle submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      showErrorToast("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    const toast = showLoadingToast(
      editingAnnouncement ? "Updating..." : "Creating...",
    );

    try {
      const url = editingAnnouncement
        ? `http://localhost:8000/api/admin/announcements/${editingAnnouncement._id}`
        : "http://localhost:8000/api/admin/announcements";

      const method = editingAnnouncement ? "patch" : "post";

      const response = await axios[method](url, formData, {
        withCredentials: true,
      });

      dismissToast(toast);

      if (response.data.success) {
        showSuccessToast(
          editingAnnouncement
            ? "Announcement updated!"
            : "Announcement created!",
        );
        setShowModal(false);
        resetForm();
        await fetchAnnouncements();
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toggle status ──────────────────────────────────────────────
  const handleToggleStatus = async (announcement) => {
    const toast = showLoadingToast("Updating status...");
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/announcements/${announcement._id}`,
        { isActive: !announcement.isActive },
        { withCredentials: true },
      );
      dismissToast(toast);
      if (response.data.success) {
        showSuccessToast(
          announcement.isActive
            ? "Announcement hidden"
            : "Announcement published",
        );
        await fetchAnnouncements();
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Delete announcement ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    const toast = showLoadingToast("Deleting...");
    try {
      await axios.delete(
        `http://localhost:8000/api/admin/announcements/${id}`,
        {
          withCredentials: true,
        },
      );
      dismissToast(toast);
      showSuccessToast("Announcement deleted");
      await fetchAnnouncements();
    } catch (err) {
      dismissToast(toast);
      showErrorToast(err.response?.data?.message || "Failed to delete");
    }
  };

  // ── Open edit modal ────────────────────────────────────────────
  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
    });
    setShowModal(true);
  };

  // ── Filters ─────────────────────────────────────────────────────
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && a.isActive) ||
      (filterStatus === "inactive" && !a.isActive);
    return matchesSearch && matchesStatus;
  });

  const activeCount = announcements.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Announcements
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeCount} active announcements
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {announcements.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {activeCount}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Inactive
              </p>
              <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
                {announcements.length - activeCount}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Announcements List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4FC3FC]" />
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? "No announcements match your search"
                    : "No announcements yet. Create your first one!"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {announcement.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              announcement.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {announcement.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(
                              announcement.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleToggleStatus(announcement)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={announcement.isActive ? "Hide" : "Show"}
                        >
                          {announcement.isActive ? (
                            <Eye className="w-4 h-4 text-gray-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(announcement)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "New Announcement"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingAnnouncement
                      ? "Update your announcement"
                      : "Create a new announcement for users"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., System Maintenance"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your announcement here..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.value === "active",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="active">Active (Visible to users)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingAnnouncement ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
