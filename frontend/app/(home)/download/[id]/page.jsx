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
} from "lucide-react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  showSuccessToast,
  showLoadingToast,
  showErrorToast,
} from "@/lib/toastConfig";

import * as jsPDF from "jspdf";

export default function PaperViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState(null);
  const [imagesSize, setImageSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [previewLoading, setPreviewLoading] = useState(false);

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
            onDownloadProgress: (progressEvent) => {
              // You can add progress tracking here if needed
              console.log(`Download progress: ${progressEvent.progress}`);
            },
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement("a");
        link.href = url;

        console.log(response.headers["content-type"]);
        console.log(response.data);

        // safe filename
        const ext = image.originalName?.split(".").pop() || "png";
        link.setAttribute(
          "download",
          `${paper.courseCode}_${paper.examType}_${paper.year}_img${i + 1}.${ext}`,
        );

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
      }
      await axios.put(
        `http://localhost:8000/api/papers/${id}/increment-download`,
      );
    } catch (err) {
      console.error("Download failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to download images. Please try again.",
      );
    } finally {
      showSuccessToast("Download successful.");
      setDownloading(false);
    }
  };

  // Handle preview - fetches the PDF and displays it
  const handlePreview = async () => {
    if (!paper) return;

    console.log(JSON.stringify(paper.images[0], null, 2));
    // console.log(JSON.stringify(paper.images[0], null, 2));

    setPreviewLoading(true);
    setError(null);

    try {
      setShowPreview(true);
      setActiveTab("preview");
    } catch (err) {
      console.error("Preview failed:", err);

      setError(err.response?.data?.message || "Failed to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!paper || !paper.images?.length) return;

    try {
      setLoading(true);
      setError(null);

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

        // Build image URL
        const imageUrl = `http://localhost:8000${image.path}`;

        // Fetch image
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert blob to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // Get image dimensions
        const img = new window.Image();

        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = base64;
        });

        // Add new PDF page except for first image
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

      doc.save(`${paper.courseCode}_${paper.examType}_${paper.year}.pdf`);
      await axios.put(
        `http://localhost:8000/api/papers/${id}/increment-download`,
      );
    } catch (err) {
      showErrorToast("PDF generation failed");
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      showSuccessToast("Download successful.");
      setLoading(false);
    }
  };

  // Get images size
  useEffect(() => {
    const getSizes = async () => {
      if (!paper?.images?.length) return;
      try {
        let totalSize = 0;

        for (let i = 0; i < paper.images.length; i++) {
          totalSize += paper.images[i].size;
        }

        const bytes = totalSize;
        const convSize = (bytes / (1024 * 1024)).toFixed(2);
        // return `${mb} MB`;
        console.log("Total image size:", convSize);
        setImageSize(convSize);

        // return convSize;
      } catch (err) {
        console.error("Failed to get image size", err);
        setError("Image size extraction failed");
        return 0;
      }
    };

    if (paper) getSizes();
  }, [paper]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading paper details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Paper
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => router.push("/download")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/download")}
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
                {/* Subject Badge */}
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    {paper.subject}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {paper.rating}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {paper.title}
                </h1>

                {/* Course Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {paper.courseCode}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{paper.examType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>
                      {paper.instructor.title} {paper.instructor.name}
                    </span>
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
                      {paper.pages} pages
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Downloads
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                      <Download className="w-4 h-4" />
                      {paper.downloads.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      File Info
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                      <FileText className="w-4 h-4" />
                      {imagesSize} MB
                      {/* {(() => {
                        const bytes = paper.images[0]?.size;
                        if (!bytes) return "N/A";
                        const mb = (bytes / (1024 * 1024)).toFixed(2);
                        return `${mb} MB`;
                      })()}{" "} */}
                      {/* • {paper.images[0].mimetype} */}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {/* <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div> */}

                {/* Download Button */}
                <div className="pt-4">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing Download...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Paper
                      </>
                    )}
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
                {paper.description}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Uploaded on{" "}
                    {new Date(paper.images[0].uploadedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview/Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === "preview"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Preview
                    {activeTab === "preview" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === "details"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Details & Metadata
                    {activeTab === "details" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === "preview" ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden aspect-3/4 relative">
                      {showPreview ? (
                        <div className="h-full overflow-auto bg-white">
                          {paper.images?.map((image, index) => (
                            <div key={index} className="relative w-full h-auto">
                              <span className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1 rounded">
                                Page {index + 1}
                              </span>
                              <Image
                                key={index}
                                // src={`http://localhost:8000/uploads${image.path}`}
                                src={`http://localhost:8000/uploads/${image.filename}`}
                                alt={`Page ${index + 1}`}
                                width={800}
                                height={1000}
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Preview Ready
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Click below to start viewing the document
                          </p>
                          <button
                            onClick={handlePreview}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Load Preview
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Document preview - {paper.pages} pages total</span>
                      <button
                        onClick={generatePDF}
                        disabled={loading}
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Download Full PDF
                      </button>
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
                            File Name
                          </span>
                          <span className="text-gray-900 dark:text-white font-mono text-sm">
                            {paper.courseCode}_{paper.examType}_{paper.year}.pdf
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">
                            File Size
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {imagesSize} MB
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">
                            Format
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {paper.images[0].mimetype}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">
                            Page Count
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {paper.pages}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Upload Date
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(
                              paper.images[0].uploadedAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Usage Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {paper.downloads.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Downloads
                          </p>
                        </div>
                        <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {paper.rating}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
