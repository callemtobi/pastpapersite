// app/(home)/upload/page.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader,
} from "lucide-react";
import { validateFiles, detectExamKeywords } from "@/lib/uploadValidation";
import { motion } from "motion/react";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
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

  // Fetch departments, courses, and instructors
  useEffect(() => {
    const fetchData = async () => {
      try {
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

    // Check total file count
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

    // Validate files
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
          const keywords = await detectExamKeywords(file);
          return { file, keywords };
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setValidationErrors(["Please select at least one image"]);
      return;
    }

    setUploadLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("course", formData.course);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("instructor", formData.instructor);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("semester", formData.semester);
      formDataToSend.append("examType", formData.examType);
      formDataToSend.append("description", formData.description || "");

      // Add files and their metadata
      selectedFiles.forEach((item, index) => {
        formDataToSend.append("images", item.file);
        formDataToSend.append(
          `imageMetadata[${index}]`,
          JSON.stringify({
            name: item.file.name,
            keywordScore: item.keywords?.score ?? 0,
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
        },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.data.success) {
        showSuccessToast("Paper uploaded successfully!");
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
          router.push("/download");
        }, 2000);
      } else {
        showErrorToast(response.data.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      setValidationErrors([`Upload failed: ${errorMessage}`]);
      showErrorToast(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Upload Paper</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share past examination papers with the community
        </p>
      </motion.div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="border border-border-light rounded-lg shadow-sm"
      >
        <div className="border border-border-light p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Paper Details
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Fill in the information about the examination paper
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="file" className="block text-sm font-medium">
                Paper Images * ({selectedFiles.length}/5)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFiles.length > 0
                    ? "border border-border-light bg-background-secondary hover:bg-background"
                    : "border border-border-light hover:"
                }`}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">
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
                      {selectedFiles.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(item.file.size / 1024 / 1024).toFixed(2)} MB •
                              Keyword Score:{" "}
                              {((item.keywords?.score ?? 0) * 100).toFixed(0)}%
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="ml-2 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedFiles.length < 5 && (
                      <label
                        htmlFor="file"
                        className="cursor-pointer inline-block"
                      >
                        <span className="font-medium text-sm">
                          Add more images
                        </span>
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
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                          Click to upload
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {" "}
                          or drag and drop
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <strong>Requirements:</strong> Up to 5 images, max 2 MB
                        each (PNG, JPG, JPEG)
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Images are automatically scanned for duplicates and
                        exam-related keywords
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
            </div>

            {/* Course / Paper Name */}
            <div className="space-y-2">
              <label htmlFor="course" className="block text-sm font-medium">
                Course / Paper Name *
              </label>
              <select
                id="course"
                value={formData.course}
                onChange={(e) => updateField("course", e.target.value)}
                className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-blue-500"
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

            {/* Department */}
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium">
                Department *
              </label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => updateField("department", e.target.value)}
                className="w-full px-4 py-2 border border-border-light bg-input-bg rounded-lg focus:outline-none focus:border-blue-500"
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

            {/* Instructor */}
            <div className="space-y-2">
              <label htmlFor="instructor" className="block text-sm font-medium">
                Instructor *
              </label>
              <select
                id="instructor"
                value={formData.instructor}
                onChange={(e) => updateField("instructor", e.target.value)}
                className="w-full px-4 py-2 border border-border-light bg-input-bg rounded-lg focus:outline-none focus:border-blue-500"
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

            {/* Year and Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="year" className="block text-sm font-medium">
                  Year *
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => updateField("year", e.target.value)}
                  className="w-full px-4 py-2 border border-border-light bg-input-bg rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select year</option>
                  {Array.from(
                    { length: 7 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="semester" className="block text-sm font-medium">
                  Semester *
                </label>
                <select
                  id="semester"
                  value={formData.semester}
                  onChange={(e) => updateField("semester", e.target.value)}
                  className="w-full px-4 py-2 border border-border-light bg-input-bg rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select semester</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
            </div>

            {/* Exam Type */}
            <div className="space-y-2">
              <label htmlFor="examType" className="block text-sm font-medium">
                Exam Type *
              </label>
              <select
                id="examType"
                value={formData.examType}
                onChange={(e) => updateField("examType", e.target.value)}
                className="w-full px-4 py-2 border border-border-light bg-input-bg rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select exam type</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Midterm">Midterm</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                placeholder="Add any additional information about the paper..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-blue-500 resize-vertical"
              />
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
                  <p className="font-medium">Upload Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Only upload papers you have the right to share</li>
                    <li>Ensure the file is clear and readable</li>
                    <li>Remove any personal information before uploading</li>
                    <li>
                      Provide accurate metadata to help others find the paper
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={
                  uploadLoading ||
                  selectedFiles.length === 0 ||
                  !formData.course ||
                  !formData.department ||
                  !formData.instructor ||
                  !formData.examType ||
                  !formData.semester ||
                  !formData.year
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border-light bg-primary-button-bg text-input-text disabled:bg-background-secondary disabled:text-foreground disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex-1 h-12"
              >
                {uploadLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload
                  </>
                )}
              </motion.button>
              <button
                type="button"
                disabled={uploadLoading}
                className="px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed border border-border-light rounded-lg hover:bg-border-light font-medium transition-colors sm:w-auto h-12"
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
                }}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="border-0 shadow-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500 rounded-lg">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Upload Successful!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Your {selectedFiles.length} image(s) have been uploaded and
                  will be available shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500 rounded-lg">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Validation Errors
                </h3>
                <ul className="space-y-1 text-sm text-red-700 dark:text-red-200">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Impact */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={{
          scale: 1.01,
          boxShadow: "0 8px 30px rgba(59, 130, 246, 0.15)",
          transition: { duration: 0.2 },
        }}
        className="border border-blue-200 dark:border-blue-900/30 rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900/10"
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.div
              whileHover={{
                scale: 1.15,
                rotate: 10,
                transition: { type: "spring", stiffness: 400 },
              }}
              className="shrink-0 p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm"
            >
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </motion.div>

            <div className="text-center sm:text-left">
              <motion.h3
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="font-semibold text-gray-900 dark:text-white mb-1"
              >
                Help Your Fellow Students
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                By uploading papers, you&apos;re contributing to a valuable
                resource that helps thousands of students prepare for their
                exams.
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
