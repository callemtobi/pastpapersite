// app/admin/papers/[id]/edit/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  BookOpen,
  Calendar,
  FileText,
  Building,
  Info,
} from "lucide-react";
import axios from "axios";
import ConfirmModal from "@/components/ConfirmModal";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";

export default function EditPaperPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    subject: "",
    department: "",
    instructorTitle: "",
    instructorName: "",
    year: "",
    semester: "",
    examType: "",
    description: "",
    pages: "",
  });

  const departments = [
    { value: "Computer Science", label: "Computer Science" },
    { value: "Software Engineering", label: "Software Engineering" },
    { value: "MLT", label: "MLT" },
    { value: "Civil Engineering", label: "Civil Engineering" },
    { value: "Electrical Engineering", label: "Electrical Engineering" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Economics", label: "Economics" },
    { value: "Business", label: "Business" },
  ];

  const subjects = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Engineering",
    "Economics",
    "Biology",
    "Business",
  ];

  const semesters = ["Spring", "Summer", "Fall"];
  const examTypes = ["Midterm", "Final Exam"];
  const instructorTitles = ["Mr.", "Mrs."];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // Fetch paper details
  useEffect(() => {
    let cancelled = false;

    const fetchPaper = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/papers/${id}`,
        );

        if (!cancelled && response.data.success) {
          const paper = response.data.paper;
          const newFormData = {
            title: paper.title || "",
            courseCode: paper.courseCode || "",
            subject: paper.subject || "",
            department: paper.department || "",
            instructorTitle: paper.instructor?.title || "",
            instructorName: paper.instructor?.name || "",
            year: paper.year || "",
            semester: paper.semester || "",
            examType: paper.examType || "",
            description: paper.description || "",
            pages: paper.pages?.toString() || "",
          };
          setOriginalFormData(newFormData);
          setFormData(newFormData);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch paper";
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) {
      fetchPaper();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check if any changes were made
  const hasChanges = () => {
    if (!originalFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  // Get changed fields for display
  const getChangedFields = () => {
    if (!originalFormData) return [];
    const changes = [];
    const fields = [
      { key: "title", label: "Title" },
      { key: "courseCode", label: "Course Code" },
      { key: "subject", label: "Subject" },
      { key: "department", label: "Department" },
      { key: "instructorTitle", label: "Instructor Title" },
      { key: "instructorName", label: "Instructor Name" },
      { key: "year", label: "Year" },
      { key: "semester", label: "Semester" },
      { key: "examType", label: "Exam Type" },
      { key: "description", label: "Description" },
      { key: "pages", label: "Pages" },
    ];

    fields.forEach(({ key, label }) => {
      if (formData[key] !== originalFormData[key]) {
        changes.push({
          label,
          old: originalFormData[key] || "(empty)",
          new: formData[key] || "(empty)",
        });
      }
    });

    return changes;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // ── 1. Required-field validation ────────────────────────────
    const requiredFields = [
      { key: "title", label: "Title" },
      { key: "courseCode", label: "Course Code" },
      { key: "subject", label: "Subject" },
      { key: "department", label: "Department" },
      { key: "instructorName", label: "Instructor Name" },
      { key: "year", label: "Year" },
      { key: "semester", label: "Semester" },
      { key: "examType", label: "Exam Type" },
    ];
    const missing = requiredFields.filter(
      (field) => !formData[field.key]?.trim(),
    );

    if (missing.length > 0) {
      const missingLabels = missing.map((f) => f.label).join(", ");
      showErrorToast(`Please fill in all required fields: ${missingLabels}`);
      return;
    }

    // ── 2. No database update when nothing changed ──────────────
    if (!hasChanges()) {
      showErrorToast(
        "No changes detected. Please update at least one field before saving.",
        { duration: 4000 },
      );
      return;
    }

    // ── 3. Show clean confirmation modal ─────────────────────────
    setShowConfirmModal(true);
  };

  // ── Execute the actual update ───────────────────────────────────
  const handleConfirmUpdate = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    const loadingToast = showLoadingToast("Saving changes...");

    try {
      const payload = {
        title: formData.title,
        courseCode: formData.courseCode,
        subject: formData.subject,
        department: formData.department,
        instructor: {
          title: formData.instructorTitle,
          name: formData.instructorName,
        },
        year: formData.year,
        semester: formData.semester,
        examType: formData.examType,
        description: formData.description || "",
        pages: parseInt(formData.pages) || 0,
      };

      const response = await axios.patch(
        `http://localhost:8000/api/papers/admin/${id}`,
        payload,
      );

      dismissToast(loadingToast);

      if (response.data.success) {
        setSuccess(true);
        setOriginalFormData({ ...formData });
        showSuccessToast("Paper updated successfully!");
        setTimeout(() => {
          router.push(`/admin/papers/${id}`);
        }, 1500);
      } else {
        showErrorToast(response.data.message || "Failed to update paper");
      }
    } catch (err) {
      dismissToast(loadingToast);
      const errorMessage =
        err.response?.data?.message || err.message || "Update failed";
      showErrorToast(`Update failed: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#4FC3FC] mx-auto" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading paper details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Paper
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => router.push("/admin/papers")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Papers
          </button>
        </div>
      </div>
    );
  }

  const changedFields = getChangedFields();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/papers/${id}`}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Paper
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Update the details of this paper
                </p>
              </div>
            </div>
            {success && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Saved successfully!</span>
              </div>
            )}
          </div>
          {/* No Changes Warning */}
          {!hasChanges() && originalFormData && (
            <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Info className="w-4 h-4" />
              <span>No changes made. Update a field to enable saving.</span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Advanced Machine Learning"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                />
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  placeholder="e.g., CS-401"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="instructorTitle"
                    value={formData.instructorTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  >
                    {instructorTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleChange}
                    placeholder="e.g., Sarah Johnson"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                    required
                  />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select semester</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Exam Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select exam type</option>
                  {examTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Number of Pages
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Provide a brief description of the paper..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC] resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/admin/papers/${id}`}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-medium transition-colors ${
                  saving || !hasChanges()
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-[#4FC3FC] hover:bg-[#29b6f6] text-white"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Clean Confirmation Modal ─────────────────────────────── */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        title="Confirm Changes"
        message="You are about to update the following fields:"
        changes={changedFields}
        confirmText="Save Changes"
        cancelText="Cancel"
        isLoading={saving}
      />
    </div>
  );
}
