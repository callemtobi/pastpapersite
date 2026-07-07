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

  // ── State for dropdown data ─────────────────────────────────────
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    course: "",
    department: "",
    instructor: "",
    year: "",
    semester: "",
    examType: "",
    description: "",
  });

  const semesters = ["Spring", "Summer", "Fall"];
  const examTypes = ["Midterm", "Final Exam"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // ── Fetch paper details and dropdown data ──────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingData(true);

        // Fetch paper details and dropdown data in parallel
        const [paperRes, deptRes, courseRes, instructorRes] = await Promise.all(
          [
            axios.get(`http://localhost:8000/api/papers/${id}`),
            axios.get("http://localhost:8000/api/admin/departments", {
              withCredentials: true,
            }),
            axios.get("http://localhost:8000/api/admin/courses", {
              withCredentials: true,
            }),
            axios.get("http://localhost:8000/api/admin/instructors", {
              withCredentials: true,
            }),
          ],
        );

        if (!cancelled) {
          // ── Set dropdown data ──────────────────────────────────────
          if (deptRes.data.success) {
            setDepartments(deptRes.data.departments || []);
          }
          if (courseRes.data.success) {
            setCourses(courseRes.data.courses || []);
          }
          if (instructorRes.data.success) {
            setInstructors(instructorRes.data.instructors || []);
          }

          // ── Set form data ──────────────────────────────────────────
          if (paperRes.data.success && paperRes.data.paper) {
            const paper = paperRes.data.paper;
            const newFormData = {
              course: paper.course?._id || paper.course || "",
              department: paper.department?._id || paper.department || "",
              instructor: paper.instructor?._id || paper.instructor || "",
              year: paper.year || "",
              semester: paper.semester || "",
              examType: paper.examType || "",
              description: paper.description || "",
            };
            setOriginalFormData(newFormData);
            setFormData(newFormData);
          }
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch data";
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingData(false);
        }
      }
    };

    if (id) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Helper: Get course name for display ────────────────────────
  const getCourseName = () => {
    if (!formData.course) return "Select a course";
    const course = courses.find((c) => c._id === formData.course);
    return course?.name || "Unknown Course";
  };

  // ── Helper: Get department name for display ────────────────────
  const getDepartmentName = () => {
    if (!formData.department) return "Select a department";
    const dept = departments.find((d) => d._id === formData.department);
    return dept?.name || "Unknown Department";
  };

  // ── Helper: Get instructor name for display ────────────────────
  const getInstructorName = () => {
    if (!formData.instructor) return "Select an instructor";
    const instructor = instructors.find((i) => i._id === formData.instructor);
    return instructor
      ? `${instructor.title} ${instructor.name}`
      : "Unknown Instructor";
  };

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
      { key: "course", label: "Course" },
      { key: "department", label: "Department" },
      { key: "instructor", label: "Instructor" },
      { key: "year", label: "Year" },
      { key: "semester", label: "Semester" },
      { key: "examType", label: "Exam Type" },
      { key: "description", label: "Description" },
    ];

    fields.forEach(({ key, label }) => {
      const oldVal = originalFormData[key] || "(empty)";
      const newVal = formData[key] || "(empty)";

      // For references, show display names
      if (key === "course") {
        const oldCourse = courses.find(
          (c) => c._id === originalFormData.course,
        );
        const newCourse = courses.find((c) => c._id === formData.course);
        if (originalFormData.course !== formData.course) {
          changes.push({
            label,
            old: oldCourse?.name || "(empty)",
            new: newCourse?.name || "(empty)",
          });
        }
      } else if (key === "department") {
        const oldDept = departments.find(
          (d) => d._id === originalFormData.department,
        );
        const newDept = departments.find((d) => d._id === formData.department);
        if (originalFormData.department !== formData.department) {
          changes.push({
            label,
            old: oldDept?.name || "(empty)",
            new: newDept?.name || "(empty)",
          });
        }
      } else if (key === "instructor") {
        const oldInstructor = instructors.find(
          (i) => i._id === originalFormData.instructor,
        );
        const newInstructor = instructors.find(
          (i) => i._id === formData.instructor,
        );
        if (originalFormData.instructor !== formData.instructor) {
          changes.push({
            label,
            old: oldInstructor
              ? `${oldInstructor.title} ${oldInstructor.name}`
              : "(empty)",
            new: newInstructor
              ? `${newInstructor.title} ${newInstructor.name}`
              : "(empty)",
          });
        }
      } else if (oldVal !== newVal) {
        changes.push({
          label,
          old: oldVal,
          new: newVal,
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
      { key: "course", label: "Course" },
      { key: "department", label: "Department" },
      { key: "instructor", label: "Instructor" },
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
        course: formData.course,
        department: formData.department,
        instructor: formData.instructor,
        year: formData.year,
        semester: formData.semester,
        examType: formData.examType,
        description: formData.description || "",
      };

      const response = await axios.patch(
        `http://localhost:8000/api/admin/papers/${id}`,
        { withCredentials: true },
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
              {/* ── Course (Paper Name) ────────────────────────────── */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select a course</option>
                  {courses
                    .filter((c) => c.isActive)
                    .map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current: {getCourseName()}
                </p>
              </div>

              {/* ── Department ───────────────────────────────────────── */}
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
                  {departments
                    .filter((d) => d.isActive)
                    .map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current: {getDepartmentName()}
                </p>
              </div>

              {/* ── Instructor ───────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Instructor <span className="text-red-500">*</span>
                </label>
                <select
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                  required
                >
                  <option value="">Select instructor</option>
                  {instructors
                    .filter((i) => i.isActive)
                    .map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.title} {instructor.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current: {getInstructorName()}
                </p>
              </div>

              {/* ── Year ─────────────────────────────────────────────── */}
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

              {/* ── Semester ─────────────────────────────────────────── */}
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

              {/* ── Exam Type ────────────────────────────────────────── */}
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

              {/* ── Description ──────────────────────────────────────── */}
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
