// app/(home)/upload/page.jsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { validateFiles } from "@/lib/uploadValidation";
import { motion } from "motion/react";
import { showSuccessToast, showErrorToast } from "@/lib/toastConfig";
import SearchSelect from "@/components/SearchSelect";

export default function UploadPage() {
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

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/papers/initial-data",
          { withCredentials: true },
        );

        if (response.data.success) {
          setDepartments(response.data.departments || []);
          setCourses(response.data.courses || []);
          setInstructors(response.data.instructors || []);
          console.log("Initial data loaded successfully:", {
            courses: response.data.courses?.length || 0,
            departments: response.data.departments?.length || 0,
            instructors: response.data.instructors?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showErrorToast("Failed to load form data. Please refresh.");

        // Fallback to individual fetches
        try {
          console.log("Attempting fallback data fetch...");
          const [deptRes, courseRes, instructorRes] = await Promise.all([
            axios.get("http://localhost:8000/api/papers/departments", {
              withCredentials: true,
            }),
            axios.get("http://localhost:8000/api/papers/courses", {
              withCredentials: true,
            }),
            axios.get("http://localhost:8000/api/papers/instructors", {
              withCredentials: true,
            }),
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
          console.log("Fallback data loaded successfully");
        } catch (fallbackError) {
          console.error("Fallback fetch error:", fallbackError);
          showErrorToast("Could not load form data. Please try again later.");
        }
      }
    };

    fetchInitialData();
  }, []);

  // Search functions
  const searchCourses = useCallback(async (searchTerm) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/papers/courses/search?q=${encodeURIComponent(searchTerm)}`,
        { withCredentials: true },
      );
      return response.data.success ? response.data.courses : [];
    } catch (error) {
      console.error("Course search error:", error);
      return [];
    }
  }, []);

  const searchDepartments = useCallback(async (searchTerm) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/papers/departments/search?q=${encodeURIComponent(searchTerm)}`,
        { withCredentials: true },
      );
      return response.data.success ? response.data.departments : [];
    } catch (error) {
      console.error("Department search error:", error);
      return [];
    }
  }, []);

  const searchInstructors = useCallback(async (searchTerm) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/papers/instructors/search?q=${encodeURIComponent(searchTerm)}`,
        { withCredentials: true },
      );
      return response.data.success ? response.data.instructors : [];
    } catch (error) {
      console.error("Instructor search error:", error);
      return [];
    }
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

    // Create array of new files with metadata
    const newFiles = Array.from(files);

    // Add each file with its metadata
    const filesWithKeywords = newFiles.map((file) => ({
      file,
      keywords: {
        score: 0,
        detected: [],
      },
    }));

    setSelectedFiles((prev) => [...prev, ...filesWithKeywords]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

      // Add files and their metadata with proper indexing
      selectedFiles.forEach((item, index) => {
        // Append the file
        formDataToSend.append("images", item.file);

        // Append metadata as a JSON string with proper index
        const metadata = {
          name: item.file.name,
          keywordScore: item.keywords?.score ?? 0,
        };
        formDataToSend.append(
          `imageMetadata[${index}]`,
          JSON.stringify(metadata),
        );
      });

      console.log("Sending files:", selectedFiles.length);
      console.log("Form data entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

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
        showSuccessToast(response.data.message);
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
        }, 10000);
      } else {
        showErrorToast(response.data.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      setValidationErrors([`Upload failed: ${errorMessage}`]);
      showErrorToast(errorMessage);
      console.error("Upload error:", error);
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
        <p className="text-muted-foreground">
          Share past examination papers with the community
        </p>
      </motion.div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="border  rounded-lg shadow-sm"
      >
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Paper Details
          </h2>
          <p className="text-muted-foreground text-sm">
            Fill in the information about the examination paper
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label
                htmlFor="file"
                className="block text-sm font-medium text-foreground"
              >
                Paper Images * ({selectedFiles.length}/5)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFiles.length > 0
                    ? "border-border bg-background-secondary hover:bg-background"
                    : "border-border hover:bg-secondary/30"
                }`}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedFiles.length} image(s) selected
                      </p>
                      <p className="text-sm text-muted-foreground">
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
                          className="flex items-center justify-between p-3 bg-background rounded border border-border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(item.file.size / 1024 / 1024).toFixed(2)} MB
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
                        <span className="font-medium text-sm ">
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
                        <span className="font-medium text-sm">
                          Click to upload
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          or drag and drop
                        </span>
                      </label>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Requirements:</strong> Up to 5 images, max 2 MB
                        each (PNG, JPG, JPEG)
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

            {/* Course / Paper Name - Searchable */}
            <SearchSelect
              id="course"
              label="Course / Paper Name"
              value={formData.course}
              onChange={(value) => updateField("course", value)}
              placeholder="Search for a course..."
              fetchOptions={searchCourses}
              initialOptions={courses}
              required={true}
              debounceDelay={300}
              minChars={1}
            />

            {/* Department - Searchable */}
            <SearchSelect
              id="department"
              label="Department"
              value={formData.department}
              onChange={(value) => updateField("department", value)}
              placeholder="Search for a department..."
              fetchOptions={searchDepartments}
              initialOptions={departments}
              required={true}
              debounceDelay={300}
              minChars={1}
            />

            {/* Instructor - Searchable */}
            <SearchSelect
              id="instructor"
              label="Instructor"
              value={formData.instructor}
              onChange={(value) => updateField("instructor", value)}
              placeholder="Search for an instructor..."
              fetchOptions={searchInstructors}
              initialOptions={instructors}
              required={true}
              debounceDelay={300}
              minChars={1}
            />

            {/* Year and Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-foreground"
                >
                  Year *
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => updateField("year", e.target.value)}
                  className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
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
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-foreground"
                >
                  Semester *
                </label>
                <select
                  id="semester"
                  value={formData.semester}
                  onChange={(e) => updateField("semester", e.target.value)}
                  className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
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
              <label
                htmlFor="examType"
                className="block text-sm font-medium text-foreground"
              >
                Exam Type *
              </label>
              <select
                id="examType"
                value={formData.examType}
                onChange={(e) => updateField("examType", e.target.value)}
                className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
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
                className="block text-sm font-medium text-foreground"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                placeholder="Add any additional information about the paper..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-vertical text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Guidelines */}
            <div className="bg-background-secondary rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">
                    Upload Guidelines:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-foreground">
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
                className="inline-flex items-center justify-center bg-primary-button-bg text-input-text border border-border-light gap-2 px-6 py-3 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex-1 h-12"
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
                className="px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed border border-border-light hover:bg-border-light rounded-lg font-medium transition-colors sm:w-auto h-12"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-0 shadow-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500 rounded-lg"
        >
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
        </motion.div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500 rounded-lg"
        >
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
        </motion.div>
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
        className="border rounded-lg shadow-sm bg-foreground text-foreground"
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.div
              whileHover={{
                scale: 1.15,
                rotate: 10,
                transition: { type: "spring", stiffness: 400 },
              }}
              className="shrink-0 p-4 rounded-full bg-background-secondary shadow-sm"
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
                className="font-semibold text-background mb-1"
              >
                Help Your Fellow Students
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-sm text-background"
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
