// app/(home)/download/[id]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Eye,
  BookOpen,
  Calendar,
  Star,
  FileText,
  ArrowLeft,
  CheckCircle,
  Loader2,
  User,
  Clock,
  AlertCircle,
  Building,
} from "lucide-react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  showSuccessToast,
  showLoadingToast,
  showErrorToast,
  dismissToast,
} from "@/lib/toastConfig";

export default function PaperViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [instructorFullName, setInstructorFullName] = useState("");

  // Paper details from backend
  useEffect(() => {
    let cancelled = false;

    const getPaperDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/papers/${id}`,
        );

        if (!cancelled) {
          if (response.data.success && response.data.paper) {
            const paperData = response.data.paper;
            setPaper(paperData);

            // Extract populated fields
            setCourseName(
              paperData.course?.name || paperData.course || "Unknown Course",
            );
            setDepartmentName(
              paperData.department?.name ||
                paperData.department ||
                "Unknown Department",
            );
            setInstructorFullName(
              paperData.instructor?.title && paperData.instructor?.name
                ? `${paperData.instructor.title} ${paperData.instructor.name}`
                : paperData.instructor?.name || "Unknown Instructor",
            );
          } else {
            setError(response.data.message || "Paper not found");
          }
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error fetching paper details";
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) {
      getPaperDetails();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDownload = async () => {
    if (!paper || !paper.images?.length) return;

    setDownloading(true);
    setError(null);

    try {
      for (let i = 0; i < paper.images.length; i++) {
        const image = paper.images[i];
        const response = await axios.get(
          `http://localhost:8000/api/papers/${id}/download?imageIndex=${i}`,
          {
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        const ext = image.originalName?.split(".").pop() || "png";
        const fileName = courseName || paper.course?.name || "paper";
        link.setAttribute(
          "download",
          `${fileName}_${paper.examType}_${paper.year}_img${i + 1}.${ext}`,
        );

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      await axios.put(
        `http://localhost:8000/api/papers/${id}/increment-download`,
      );
      showSuccessToast("Download successful.");
    } catch (err) {
      console.error("Download failed:", err);
      showErrorToast(
        err.response?.data?.message ||
          "Failed to download images. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setError(null);

    try {
      setShowPreview(true);
      setActiveTab("preview");
    } catch (err) {
      console.error("Preview failed:", err);
      showErrorToast("Failed to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!paper || !paper.images?.length) return;

    const loadingToast = showLoadingToast("Generating PDF...");

    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < paper.images.length; i++) {
        const image = paper.images[i];

        // ── Debug: Log the image object ──
        console.log(`Image ${i}:`, image);

        // ── Try multiple path options ──
        let imagePath =
          image.path || image.filePath || image.url || image.filename;

        if (!imagePath) {
          console.error(`No path found for image ${i}:`, image);
          showErrorToast(`Image ${i + 1} has no valid path`);
          continue;
        }

        // ── Normalize the path ──
        let imageUrl;
        if (imagePath.startsWith("http")) {
          imageUrl = imagePath;
        } else if (imagePath.startsWith("/uploads/")) {
          imageUrl = `http://localhost:8000${imagePath}`;
        } else if (imagePath.startsWith("/")) {
          imageUrl = `http://localhost:8000${imagePath}`;
        } else {
          imageUrl = `http://localhost:8000/uploads/${imagePath}`;
        }

        console.log(`Fetching image ${i} from:`, imageUrl);

        const response = await fetch(imageUrl);

        if (!response.ok) {
          console.error(
            `Failed to fetch image ${i}: ${response.status} ${response.statusText}`,
          );
          showErrorToast(`Failed to load image ${i + 1}`);
          continue;
        }

        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const img = new window.Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = base64;
        });

        if (i > 0) {
          doc.addPage();
        }

        const imgWidth = img.width;
        const imgHeight = img.height;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        const pdfWidth = imgWidth * ratio;
        const pdfHeight = imgHeight * ratio;
        const x = (pageWidth - pdfWidth) / 2;
        const y = (pageHeight - pdfHeight) / 2;

        doc.addImage(
          base64,
          image.mimetype === "image/png" ? "PNG" : "JPEG",
          x,
          y,
          pdfWidth,
          pdfHeight,
        );
      }

      const fileName = courseName || paper.course?.name || "paper";
      doc.save(`${fileName}_${paper.examType}_${paper.year}.pdf`);
      await axios.put(
        `http://localhost:8000/api/papers/${id}/increment-download`,
      );
      dismissToast(loadingToast);
      showSuccessToast("PDF downloaded successfully.");
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast("PDF generation failed");
      console.error("PDF generation failed:", err);
    }
  };

  // Get images size
  const getImageSize = () => {
    if (!paper?.images?.length) return "0";
    const totalSize = paper.images.reduce((sum, img) => sum + img.size, 0);
    return (totalSize / (1024 * 1024)).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#4FC3FC] mx-auto" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading paper details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-background-secondary rounded-2xl shadow-xl p-8 text-center space-y-4 border border-border-light">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Error Loading Paper
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => router.push("/download")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-background-secondary border-b border-border-light sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/download")}
              className="inline-flex items-center gap-2 text-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Browse</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Paper ID: {paper._id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Paper Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Paper Info Card */}
            <div className="bg-background-secondary rounded-2xl shadow-lg overflow-hidden border border-border-light">
              <div className="p-6 space-y-6">
                {/* Department Badge */}
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    <Building className="w-4 h-4" />
                    {departmentName}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold text-foreground">
                      {paper.rating || 0}
                    </span>
                  </div>
                </div>

                {/* Title - Course Name */}
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {courseName}
                </h1>

                {/* Course Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400">•</span>
                    <span>{paper.examType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{instructorFullName}</span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-light">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Semester
                    </p>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <Calendar className="w-4 h-4" />
                      {paper.semester} {paper.year}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pages
                    </p>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <FileText className="w-4 h-4" />
                      {paper.pages || 0} pages
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Downloads
                    </p>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <Download className="w-4 h-4" />
                      {paper.downloads?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      File Info
                    </p>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <FileText className="w-4 h-4" />
                      {getImageSize()} MB
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:bg-gray-400 text-white rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Images
                      </>
                    )}
                  </button>

                  <button
                    onClick={generatePDF}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground rounded-xl font-medium transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    Download as PDF
                  </button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    By downloading, you agree to our terms of use
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-background-secondary rounded-2xl shadow-lg p-6 border border-border-light">
              <h3 className="font-semibold text-foreground mb-3">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {paper.description || "No description provided."}
              </p>
              <div className="mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Uploaded on{" "}
                    {paper.createdAt
                      ? new Date(paper.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview/Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-background-secondary rounded-2xl shadow-lg overflow-hidden border border-border-light">
              {/* Tabs */}
              <div className="border-b border-border-light">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === "preview"
                        ? "text-[#4FC3FC] border-b-2 border-[#4FC3FC]"
                        : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === "details"
                        ? "text-[#4FC3FC] border-b-2 border-[#4FC3FC]"
                        : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                    }`}
                  >
                    Details & Metadata
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === "preview" ? (
                  <div className="space-y-4">
                    <div
                      className="bg-background-secondary rounded-xl overflow-hidden"
                      style={{ minHeight: "350px" }}
                    >
                      {showPreview && paper.images?.length > 0 ? (
                        <div className="h-full overflow-y-auto bg-background-secondary p-4">
                          {paper.images.map((image, index) => (
                            <div key={index} className="mb-6 last:mb-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  Page {index + 1} of {paper.images.length}
                                </span>
                              </div>
                              <div className="relative w-full">
                                <Image
                                  // src={`http://localhost:8000/uploads/${image.filename}`}
                                  src={`${paper.images[0].url}`}
                                  alt={`Page ${index + 1}`}
                                  width={800}
                                  height={1000}
                                  unoptimized
                                  className="w-full h-auto rounded-lg shadow-md"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center h-[150]">
                          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                          <h4 className="text-lg font-medium text-foreground mb-2">
                            Preview Ready
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Click below to start viewing the document
                          </p>
                          <button
                            onClick={handlePreview}
                            disabled={previewLoading}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg transition-colors"
                          >
                            {previewLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            Load Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Document Information
                      </h4>
                      <div className="bg-background-secondary rounded-lg p-4 space-y-2 border border-border-light">
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            Course
                          </span>
                          <span className="text-foreground font-medium ps-2">
                            {courseName}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            Department
                          </span>
                          <span className="text-foreground ps-2">
                            {departmentName}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            Instructor
                          </span>
                          <span className="text-foreground ps-2">
                            {instructorFullName}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            Semester
                          </span>
                          <span className="text-foreground">
                            {paper.semester} {paper.year}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            Exam Type
                          </span>
                          <span className="text-foreground">
                            {paper.examType}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            Pages
                          </span>
                          <span className="text-foreground">
                            {paper.pages || 0}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border-light">
                          <span className="text-gray-600 dark:text-gray-400">
                            File Size
                          </span>
                          <span className="text-foreground">
                            {getImageSize()} MB
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Upload Date
                          </span>
                          <span className="text-foreground">
                            {paper.createdAt
                              ? new Date(paper.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Usage Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-linear-to-br bg-background-secondary border border-border-light rounded-lg p-4">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {paper.downloads?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Downloads
                          </p>
                        </div>
                        <div className="bg-linear-to-br bg-background-secondary border border-border-light rounded-lg p-4">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {paper.rating || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Average Rating
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className=" rounded-lg p-4 bg-background-secondary border border-border-light">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-foreground" />
                        <div>
                          <p className="text-sm  text-primary font-bold">
                            Authentic Document
                          </p>
                          <p className="text-xs text-foreground">
                            This paper has been verified and reviewed by our
                            academic team
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
