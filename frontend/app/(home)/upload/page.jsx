// "use client";

// export default function Upload() {
//   return (
//     <div>
//       <h1>Upload</h1>
//       <p>Welcome to the Upload page!</p>
//     </div>
//   );
// }

// -----------------------------------------------------------

"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    subject: "",
    year: "",
    semester: "",
    examType: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      setSelectedFile(null);
    }, 3000);
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
                  Your paper has been uploaded and will be available shortly.
                </p>
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
                Paper File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFile
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      required
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
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
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
                  <option value="Winter">Winter</option>
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
                <option value="Quiz">Quiz</option>
                <option value="Practice">Practice Set</option>
                <option value="Assignment">Assignment</option>
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex-1 h-12"
              >
                <Upload className="w-5 h-5" />
                Upload Paper
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white font-medium transition-colors sm:w-auto h-12"
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
                  setSelectedFile(null);
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
                By uploading papers, youre contributing to a valuable resource
                that helps thousands of students prepare for their exams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
