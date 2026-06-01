"use client";

import { useState, useRef } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader,
} from "lucide-react";
import {
  validateFiles,
  calculateImageHash,
  checkDuplicate,
  detectExamKeywords,
} from "@/lib/uploadValidation";

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    subject: "",
    year: "",
    semester: "",
    examType: "",
    description: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageHashes, setImageHashes] = useState([]);

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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate files
    const validation = validateFiles(files);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Calculate hashes and check for duplicates
    const newFiles = Array.from(files);
    const newHashes = [];
    const duplicateErrors = [];

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const hash = await calculateImageHash(newFiles[i]);
        const duplicate = checkDuplicate(hash, [...imageHashes, ...newHashes]);

        if (duplicate.isDuplicate) {
          duplicateErrors.push(
            `${newFiles[i].name}: Similar to an existing image (${duplicate.similarity.toFixed(1)}% match)`,
          );
        } else {
          newHashes.push(hash);
        }
      }

      if (duplicateErrors.length > 0) {
        setValidationErrors(duplicateErrors);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Detect keywords
      const filesWithKeywords = await Promise.all(
        newFiles.map(async (file) => {
          const keywords = await detectExamKeywords(file);
          return { file, keywords };
        }),
      );

      // Append new files to existing ones instead of replacing
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesWithKeywords]);
      setImageHashes((prevHashes) => [...prevHashes, ...newHashes]);

      // Reset file input after successful addition
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setValidationErrors([`Error processing files: ${error.message}`]);
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newHashes = imageHashes.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImageHashes(newHashes);
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
      formDataToSend.append("title", formData.title);
      formDataToSend.append("courseCode", formData.courseCode);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("semester", formData.semester);
      formDataToSend.append("examType", formData.examType);
      formDataToSend.append("description", formData.description);

      // Add files and their metadata
      selectedFiles.forEach((item, index) => {
        formDataToSend.append("images", item.file);
        formDataToSend.append(
          `imageMetadata[${index}]`,
          JSON.stringify({
            name: item.file.name,
            hash: imageHashes[index],
            keywordScore: item.keywords.score,
          }),
        );
      });

      // Send to backend using axios
      const response = await axios.post("/api/papers/upload", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setFormData({
          title: "",
          courseCode: "",
          subject: "",
          year: "",
          semester: "",
          examType: "",
          description: "",
        });
        setSelectedFiles([]);
        setImageHashes([]);
        setValidationErrors([]);
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      setValidationErrors([`Upload failed: ${errorMessage}`]);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Paper
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share past examination papers with the community
        </p>
      </div>

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

      {/* Upload Form */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Paper Images * ({selectedFiles.length}/5)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFiles.length > 0
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                }`}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
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

                    {/* Selected Files List */}
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
                              {(item.keywords.score * 100).toFixed(0)}%
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
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
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

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Paper Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Calculus II - Final Exam 2025"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Course Code and Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="courseCode"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Course Code *
                </label>
                <input
                  id="courseCode"
                  type="text"
                  placeholder="e.g., MATH 2420"
                  value={formData.courseCode}
                  onChange={(e) => updateField("courseCode", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select subject</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Economics">Economics</option>
                  <option value="Biology">Biology</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>

            {/* Year and Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Year *
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => updateField("year", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Semester *
                </label>
                <select
                  id="semester"
                  value={formData.semester}
                  onChange={(e) => updateField("semester", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Exam Type *
              </label>
              <select
                id="examType"
                value={formData.examType}
                onChange={(e) => updateField("examType", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                placeholder="Add any additional information about the paper..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-vertical"
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
              <button
                type="submit"
                disabled={uploadLoading || selectedFiles.length === 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex-1 h-12"
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
              </button>
              <button
                type="button"
                disabled={uploadLoading}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium transition-colors sm:w-auto h-12"
                onClick={() => {
                  setFormData({
                    title: "",
                    courseCode: "",
                    subject: "",
                    year: "",
                    semester: "",
                    examType: "",
                    description: "",
                  });
                  setSelectedFiles([]);
                  setImageHashes([]);
                  setValidationErrors([]);
                }}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Community Impact */}
      <div className="border border-blue-200 dark:border-blue-900/30 rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900/10">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0 p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Help Your Fellow Students
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                By uploading papers, you&apos;re contributing to a valuable
                resource that helps thousands of students prepare for their
                exams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
