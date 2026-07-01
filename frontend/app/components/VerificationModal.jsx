// components/VerificationModal.jsx
"use client";

import {
  Shield,
  X,
  Check,
  Loader2,
  Clock,
  AlertTriangle,
  Building,
  User,
  Calendar,
  FileText,
} from "lucide-react";

export default function VerificationModal({
  isOpen,
  onClose,
  paper,
  onApprove,
  onReject,
  isLoading,
}) {
  if (!isOpen || !paper) return null;

  // ── Helper functions ────────────────────────────────────────────
  const getCourseName = () => {
    if (!paper) return "Unknown Course";
    return paper.course?.name || paper.course || "Unknown Course";
  };

  const getDepartmentName = () => {
    if (!paper) return "Unknown Department";
    return paper.department?.name || paper.department || "Unknown Department";
  };

  const getInstructorName = () => {
    if (!paper) return "Unknown Instructor";
    if (paper.instructor?.title && paper.instructor?.name) {
      return `${paper.instructor.title} ${paper.instructor.name}`;
    }
    return paper.instructor?.name || paper.instructor || "Unknown Instructor";
  };

  const getOcrScoreColor = (score) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { label: "Approved", color: "text-green-500" },
      pending: { label: "Pending", color: "text-yellow-500" },
      rejected: { label: "Rejected", color: "text-red-500" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const ocrScore = paper.images?.[0]?.ocrScore || 0;
  const imageStatus = paper.images?.[0]?.verificationStatus || "pending";
  const statusBadge = getStatusBadge(imageStatus);
  const courseName = getCourseName();
  const departmentName = getDepartmentName();
  const instructorName = getInstructorName();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Verify Paper
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review and approve or reject this paper
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Paper Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Course</p>
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {courseName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Department
              </p>
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {departmentName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Instructor
              </p>
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {instructorName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exam Type
              </p>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {paper.examType || "N/A"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* OCR Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                OCR Score
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {ocrScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getOcrScoreColor(ocrScore)}`}
                style={{ width: `${ocrScore}%` }}
              />
            </div>
            {paper.images?.[0]?.verificationReason && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {paper.images[0].verificationReason}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Status:
            </span>
            <span className={`text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Matched Patterns */}
          {paper.images?.[0]?.matchedPatterns?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Detected Patterns
              </p>
              <div className="flex flex-wrap gap-1">
                {paper.images[0].matchedPatterns
                  .slice(0, 4)
                  .map((pattern, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      {pattern.pattern.length > 25
                        ? pattern.pattern.substring(0, 25) + "..."
                        : pattern.pattern}
                    </span>
                  ))}
                {paper.images[0].matchedPatterns.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{paper.images[0].matchedPatterns.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Images Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{paper.images?.length || 0} image(s)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
