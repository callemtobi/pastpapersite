// app/admin/papers/[id]/page.jsx
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
  Edit,
  Trash2,
  Shield,
  Check,
  X,
  XCircle,
  Building,
} from "lucide-react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  showSuccessToast,
  showLoadingToast,
  showErrorToast,
  dismissToast,
} from "@/lib/toastConfig";
import VerificationModal from "@/components/VerificationModal";

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
  const [currentPage, setCurrentPage] = useState(0);
  // ── Verification Modal State ─────────────────────────────────
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPaperForVerification, setSelectedPaperForVerification] =
    useState(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  // ── Helper: Get course name ────────────────────────────────────
  const getCourseName = () => {
    if (!paper) return "Unknown Course";
    return paper.course?.name || paper.course || "Unknown Course";
  };

  // ── Helper: Get department name ────────────────────────────────
  const getDepartmentName = () => {
    if (!paper) return "Unknown Department";
    return paper.department?.name || paper.department || "Unknown Department";
  };

  // ── Helper: Get instructor full name ───────────────────────────
  const getInstructorName = () => {
    if (!paper) return "Unknown Instructor";
    if (paper.instructor?.title && paper.instructor?.name) {
      return `${paper.instructor.title} ${paper.instructor.name}`;
    }
    return paper.instructor?.name || paper.instructor || "Unknown Instructor";
  };

  // Paper details from backend
  useEffect(() => {
    let cancelled = false;

    const getPaperDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/admin/papers/${id}`,
          { withCredentials: true },
        );

        if (!cancelled) {
          if (response.data.success && response.data.paper) {
            setPaper(response.data.paper);
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
        const courseName = getCourseName().replace(/\s+/g, "_");
        link.setAttribute(
          "download",
          `${courseName}_${paper.examType}_${paper.year}_img${i + 1}.${ext}`,
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
        const imageUrl = `http://localhost:8000${image.path}`;

        const response = await fetch(imageUrl);
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

      const courseName = getCourseName().replace(/\s+/g, "_");
      doc.save(`${courseName}_${paper.examType}_${paper.year}.pdf`);
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

  const getImageSize = () => {
    if (!paper?.images?.length) return "0";
    const totalSize = paper.images.reduce((sum, img) => sum + img.size, 0);
    return (totalSize / (1024 * 1024)).toFixed(2);
  };

  // ── Delete Paper Function ─────────────────────────────────────
  const handleDeletePaper = async () => {
    const courseName = getCourseName();
    if (!confirm(`Are you sure you want to delete "${courseName}"?`)) return;

    const loadingToast = showLoadingToast("Deleting paper...");

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/admin/papers/${id}`,
        { withCredentials: true },
      );

      dismissToast(loadingToast);

      if (response.data.success) {
        showSuccessToast("Paper deleted successfully!");
        setTimeout(() => {
          router.push("/admin/papers");
        }, 1500);
      } else {
        showErrorToast(response.data.message || "Failed to delete paper");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to delete paper");
    }
  };

  // ── Verification Functions ─────────────────────────────────────

  const openVerificationModal = () => {
    // Ensure paper data is properly formatted before passing to modal
    const formattedPaper = {
      ...paper,
      courseName: paper.course?.name || "Unknown Course",
      departmentName: paper.department?.name || "Unknown Department",
      instructorName:
        paper.instructor?.title && paper.instructor?.name
          ? `${paper.instructor.title} ${paper.instructor.name}`
          : paper.instructor?.name || "Unknown Instructor",
    };
    setSelectedPaperForVerification(formattedPaper);
    setShowVerificationModal(true);
  };

  const handleApprovePaper = async () => {
    if (!selectedPaperForVerification) return;

    setVerificationInProgress(true);
    const loadingToast = showLoadingToast("Approving paper...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/papers/${selectedPaperForVerification._id}`,
        { status: "approved" },
        { withCredentials: true },
      );

      dismissToast(loadingToast);

      if (response.data.success) {
        setPaper((prev) => ({ ...prev, status: "approved" }));
        showSuccessToast("Paper approved successfully!");
        setShowVerificationModal(false);
        setSelectedPaperForVerification(null);
      } else {
        showErrorToast(response.data.message || "Failed to approve paper");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to approve paper");
    } finally {
      setVerificationInProgress(false);
    }
  };

  const handleRejectPaper = async () => {
    if (!selectedPaperForVerification) return;

    setVerificationInProgress(true);
    const loadingToast = showLoadingToast("Rejecting paper...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/papers/${selectedPaperForVerification._id}`,
        { status: "rejected" },
        { withCredentials: true },
      );

      dismissToast(loadingToast);

      if (response.data.success) {
        setPaper((prev) => ({ ...prev, status: "rejected" }));
        showSuccessToast("Paper rejected successfully!");
        setShowVerificationModal(false);
        setSelectedPaperForVerification(null);
      } else {
        showErrorToast(response.data.message || "Failed to reject paper");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to reject paper");
    } finally {
      setVerificationInProgress(false);
    }
  };

  // ── Get Status Badge ───────────────────────────────────────────
  const getStatusBadge = () => {
    const status = paper?.status;
    const statusMap = {
      approved: {
        label: "Verified",
        icon: CheckCircle,
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        border: "border-green-200 dark:border-green-800",
      },
      pending: {
        label: "Pending Review",
        icon: Clock,
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        border: "border-yellow-200 dark:border-yellow-800",
      },
      rejected: {
        label: "Rejected",
        icon: XCircle,
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        border: "border-red-200 dark:border-red-800",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
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

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;
  const isPending = paper.status === "pending";
  const isRejected = paper.status === "rejected";
  const courseName = getCourseName();
  const departmentName = getDepartmentName();
  const instructorName = getInstructorName();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/admin/papers")}
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6 space-y-6">
                  {/* Department Badge */}
                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      <Building className="w-4 h-4" />
                      {departmentName}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {paper.rating || 0}
                      </span>
                    </div>
                  </div>

                  {/* Title - Course Name */}
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    {courseName}
                  </h1>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusBadge.border} ${statusBadge.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Course Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {paper.examType}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>
                        {paper.semester} {paper.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{instructorName}</span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Semester
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4" />
                        {paper.semester} {paper.year}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Pages
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <FileText className="w-4 h-4" />
                        {paper.pages || 0} pages
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Downloads
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Download className="w-4 h-4" />
                        {paper.downloads?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        File Info
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
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
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-all"
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {paper.description || "No description provided."}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      Uploaded on{" "}
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
            </div>

            {/* Right Column - Preview/Viewer */}
            <div className="lg:col-span-2">
              {/* Status Banner */}
              <div
                className={`mb-4 p-4 rounded-xl border ${statusBadge.border} ${statusBadge.color} flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-medium">
                    This paper is <strong>{statusBadge.label}</strong>
                  </span>
                </div>
                {(isPending || isRejected) && (
                  <button
                    onClick={openVerificationModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Review Now
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === "preview"
                          ? "text-[#4FC3FC] dark:text-[#4FC3FC] border-b-2 border-[#4FC3FC]"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === "details"
                          ? "text-[#4FC3FC] dark:text-[#4FC3FC] border-b-2 border-[#4FC3FC]"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                        className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden"
                        style={{ minHeight: "350px" }}
                      >
                        {showPreview && paper.images?.length > 0 ? (
                          <div className="h-full overflow-y-auto bg-white p-4">
                            {paper.images.map((image, index) => (
                              <div key={index} className="mb-6 last:mb-0">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Page {index + 1} of {paper.images.length}
                                  </span>
                                </div>
                                <div className="relative w-full">
                                  <Image
                                    src={`http://localhost:8000/uploads/${image.filename}`}
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
                          <div className="flex flex-col items-center justify-center p-8 text-center h-150">
                            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Document Information
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              Course
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {courseName}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              Department
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {departmentName}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              Instructor
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {instructorName}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              Semester
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {paper.semester} {paper.year}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              Exam Type
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {paper.examType}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              Pages
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {paper.pages || 0}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                              File Size
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {getImageSize()} MB
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Upload Date
                            </span>
                            <span className="text-gray-900 dark:text-white">
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
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Usage Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {paper.downloads?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Downloads
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {paper.rating || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Average Rating
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              Authentic Document
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                              This paper has been verified and reviewed by our
                              academic team
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Action Buttons Below Preview ─────────────────── */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {isPending || isRejected ? (
                        <button
                          onClick={openVerificationModal}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Verify Paper
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Status: {statusBadge.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/papers/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={handleDeletePaper}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── Verification Modal ──────────────────────────────────── */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setSelectedPaperForVerification(null);
        }}
        paper={selectedPaperForVerification}
        onApprove={handleApprovePaper}
        onReject={handleRejectPaper}
        isLoading={verificationInProgress}
      />
    </div>
  );
}
