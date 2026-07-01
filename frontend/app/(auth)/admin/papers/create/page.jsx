// app/admin/papers/create/page.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Upload,
  FileText,
  AlertCircle,
  X,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import { validateFiles, detectExamKeywords } from "@/lib/uploadValidation";
import {
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";

export default function CreatePaperPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [formData, setFormData] = useState({
    course: "",
    department: "",
    instructor: "",
    year: "",
    semester: "",
    examType: "",
    description: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const semesters = ["Spring", "Summer", "Fall"];
  const examTypes = ["Midterm", "Final Exam"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // ── Fetch departments, courses, and instructors ──────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptRes, courseRes, instructorRes] = await Promise.all([
          axios.get("http://localhost:8000/api/admin/departments"),
          axios.get("http://localhost:8000/api/admin/courses"),
          axios.get("http://localhost:8000/api/admin/instructors"),
        ]);

        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments || []);
        }
        if (courseRes.data.success) {
          setCourses(courseRes.data.courses || []);
        }
        if (instructorRes.data.success) {
          setInstructors(instructorRes.data.instructors || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast("Failed to load form data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e) => {
    setValidationErrors([]);
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 5) {
      setValidationErrors([
        `Maximum 5 images allowed. You already have ${selectedFiles.length} image(s). You can only add ${5 - selectedFiles.length} more.`,
      ]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const validation = validateFiles(files);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const newFiles = Array.from(files);
    try {
      const filesWithKeywords = await Promise.all(
        newFiles.map(async (file) => {
          try {
            const keywords = await detectExamKeywords(file);
            return {
              file,
              keywords: {
                score: keywords?.score ?? 0,
                detected: keywords?.detected ?? [],
                ...(keywords || {}),
              },
            };
          } catch (keywordError) {
            console.warn(
              "Keyword detection failed for file:",
              file.name,
              keywordError,
            );
            return {
              file,
              keywords: {
                score: 0,
                detected: [],
              },
            };
          }
        }),
      );

      setSelectedFiles((prevFiles) => [...prevFiles, ...filesWithKeywords]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setValidationErrors([`Error processing files: ${error.message}`]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setValidationErrors([]);
  };

  const hasLowKeywordScore = selectedFiles.some(
    (item) => (item.keywords?.score ?? 0) < 0.3,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validate required fields ──────────────────────────────────
    const requiredFields = [
      { key: "course", label: "Course" },
      { key: "department", label: "Department" },
      { key: "instructor", label: "Instructor" },
      { key: "year", label: "Year" },
      { key: "semester", label: "Semester" },
      { key: "examType", label: "Exam Type" },
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field.key]?.trim(),
    );

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map((f) => f.label).join(", ");
      showErrorToast(`Please fill in all required fields: ${missingLabels}`);
      return;
    }

    if (selectedFiles.length === 0) {
      showErrorToast("Please select at least one image to upload");
      return;
    }

    // ── Verify selected references exist ──────────────────────────
    const selectedCourse = courses.find((c) => c._id === formData.course);
    const selectedDept = departments.find((d) => d._id === formData.department);
    const selectedInstructor = instructors.find(
      (i) => i._id === formData.instructor,
    );

    if (!selectedCourse || !selectedCourse.isActive) {
      showErrorToast("Selected course is invalid or inactive");
      return;
    }
    if (!selectedDept || !selectedDept.isActive) {
      showErrorToast("Selected department is invalid or inactive");
      return;
    }
    if (!selectedInstructor || !selectedInstructor.isActive) {
      showErrorToast("Selected instructor is invalid or inactive");
      return;
    }

    // ── Low keyword score warning ─────────────────────────────────
    if (hasLowKeywordScore) {
      const confirmUpload = confirm(
        "Some images have low exam-related keyword scores. Do you want to continue?",
      );
      if (!confirmUpload) return;
    }

    const loadingToast = showLoadingToast("Uploading paper...");
    setUploadLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();

      // ── Send ObjectId references ─────────────────────────────────
      formDataToSend.append("course", formData.course);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("instructor", formData.instructor);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("semester", formData.semester);
      formDataToSend.append("examType", formData.examType);
      formDataToSend.append("description", formData.description || "");

      // ── Add files and their metadata ─────────────────────────────
      selectedFiles.forEach((item, index) => {
        formDataToSend.append("images", item.file);
        formDataToSend.append(
          `imageMetadata[${index}]`,
          JSON.stringify({
            name: item.file.name,
            keywordScore: item.keywords?.score ?? 0,
            detectedKeywords: item.keywords?.detected ?? [],
          }),
        );
      });

      const response = await axios.post(
        "http://localhost:8000/api/papers/upload",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          },
        },
      );

      dismissToast(loadingToast);

      if (response.status === 401) {
        showErrorToast("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      if (response.data.success) {
        const courseName = selectedCourse?.name || "Paper";
        showSuccessToast(
          `"${courseName}" uploaded with ${selectedFiles.length} image(s)!`,
        );
        setUploadSuccess(true);

        setTimeout(() => {
          setUploadSuccess(false);
          setFormData({
            course: "",
            department: "",
            instructor: "",
            year: "",
            semester: "",
            examType: "",
            description: "",
          });
          setSelectedFiles([]);
          setValidationErrors([]);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          router.push("/admin/papers");
        }, 2500);
      } else {
        showErrorToast(
          response.data.message || "Failed to upload paper. Please try again.",
        );
      }
    } catch (error) {
      dismissToast(loadingToast);
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      showErrorToast(`Upload failed: ${errorMessage}`);
      setValidationErrors([errorMessage]);
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create Paper
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {selectedFiles.length} image(s) selected
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-4xl mx-auto">
          {/* Upload Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Paper Details
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Fill in the information about the examination paper
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Paper Images * ({selectedFiles.length}/5)
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    selectedFiles.length > 0
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                      : validationErrors.length > 0
                        ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                        : "border-gray-300 dark:border-gray-600 hover:border-[#4FC3FC] dark:hover:border-[#4FC3FC]"
                  }`}
                >
                  {selectedFiles.length > 0 ? (
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40">
                        <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedFiles.length} image(s) selected
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total size:{" "}
                          {(
                            selectedFiles.reduce(
                              (sum, item) => sum + item.file.size,
                              0,
                            ) /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>

                      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {selectedFiles.map((item, idx) => {
                          const keywords = item.keywords || {
                            score: 0,
                            detected: [],
                          };
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.file.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                  • Keyword Score:{" "}
                                  {((keywords.score ?? 0) * 100).toFixed(0)}%
                                </p>
                                {keywords.detected?.length > 0 && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    Detected:{" "}
                                    {keywords.detected.slice(0, 3).join(", ")}
                                    {keywords.detected.length > 3 && "..."}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="ml-2 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {selectedFiles.length < 5 && (
                        <label
                          htmlFor="file"
                          className="cursor-pointer inline-block text-[#4FC3FC] hover:text-[#29b6f6] font-medium text-sm"
                        >
                          + Add more images
                        </label>
                      )}
                      <input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <label htmlFor="file" className="cursor-pointer">
                          <span className="text-[#4FC3FC] hover:text-[#29b6f6] font-medium">
                            Click to upload
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            or drag and drop
                          </span>
                        </label>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                          <strong>Requirements:</strong> Up to 5 images, max 2
                          MB each (PNG, JPG, JPEG)
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Images are automatically scanned for duplicate content
                          and exam-related keywords
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {hasLowKeywordScore && selectedFiles.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Some images have low exam-related keyword scores. Please
                      verify these are exam papers.
                    </span>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400 mt-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <ul className="space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {uploadLoading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#4FC3FC] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ── Course (Paper Name) ────────────────────────────── */}
              <div className="space-y-2">
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  id="course"
                  value={formData.course}
                  onChange={(e) => updateField("course", e.target.value)}
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
              </div>

              {/* ── Department ───────────────────────────────────────── */}
              <div className="space-y-2">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
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
              </div>

              {/* ── Instructor ───────────────────────────────────────── */}
              <div className="space-y-2">
                <label
                  htmlFor="instructor"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Instructor <span className="text-red-500">*</span>
                </label>
                <select
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => updateField("instructor", e.target.value)}
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
              </div>

              {/* ── Year, Semester, Exam Type ───────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => updateField("year", e.target.value)}
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

                <div className="space-y-2">
                  <label
                    htmlFor="semester"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => updateField("semester", e.target.value)}
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

                <div className="space-y-2">
                  <label
                    htmlFor="examType"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="examType"
                    value={formData.examType}
                    onChange={(e) => updateField("examType", e.target.value)}
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
              </div>

              {/* ── Description ───────────────────────────────────────── */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  placeholder="Add any additional information about the paper..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC] resize-none"
                />
              </div>

              {/* ── Guidelines ────────────────────────────────────────── */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
                    <p className="font-medium">Upload Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      <li>Only upload papers you have the right to share</li>
                      <li>Ensure images are clear and readable</li>
                      <li>Remove any personal information before uploading</li>
                      <li>Maximum 5 images per paper</li>
                      <li>Provide accurate metadata to help others find it</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ── Submit Buttons ────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={uploadLoading || selectedFiles.length === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Paper
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={() => {
                    setFormData({
                      course: "",
                      department: "",
                      instructor: "",
                      year: "",
                      semester: "",
                      examType: "",
                      description: "",
                    });
                    setSelectedFiles([]);
                    setValidationErrors([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
