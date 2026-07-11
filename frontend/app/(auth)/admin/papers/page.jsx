// app/admin/content/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Shield,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";
import ConfirmModal from "@/components/ConfirmModal";

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Confirmation Modal State ──────────────────────────────────
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    changes: [],
    confirmText: "Confirm",
    onConfirm: null,
    isLoading: false,
  });

  // Fetch papers from database
  useEffect(() => {
    let cancelled = false;
    const getPapers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/admin/papers",
          { withCredentials: true },
        );
        if (!cancelled) {
          if (response.data.success && response.data.papers) {
            setPapers(response.data.papers);
          } else {
            setPapers([]);
          }
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error fetching papers data";
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    getPapers();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter papers based on search, filters, and tabs
  const getFilteredPapers = () => {
    let filtered = papers;

    if (searchQuery) {
      filtered = filtered.filter((paper) => {
        const courseName = paper.course?.name || "";
        const deptName = paper.department?.name || "";
        const instructorName = paper.instructor?.name || "";
        const searchLower = searchQuery.toLowerCase();
        return (
          courseName.toLowerCase().includes(searchLower) ||
          deptName.toLowerCase().includes(searchLower) ||
          instructorName.toLowerCase().includes(searchLower) ||
          paper.examType?.toLowerCase().includes(searchLower) ||
          paper.semester?.toLowerCase().includes(searchLower) ||
          paper.year?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (paper) => paper.department?.name === filterDepartment,
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((paper) => paper.status === filterStatus);
    }

    if (filterYear !== "all") {
      filtered = filtered.filter((paper) => paper.year === filterYear);
    }

    if (activeTab === "pending") {
      filtered = filtered.filter((paper) => paper.status === "pending");
    } else if (activeTab === "approved") {
      filtered = filtered.filter((paper) => paper.status === "approved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((paper) => paper.status === "rejected");
    }

    return filtered;
  };

  const filteredPapers = getFilteredPapers();

  // Pagination calculations
  const totalItems = filteredPapers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPapers = filteredPapers.slice(startIndex, endIndex);

  // Get counts for tabs
  const getTabCount = (status) => {
    if (status === "all") return papers.length;
    return papers.filter((p) => p.status === status).length;
  };

  // Handle page change
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setSelectedPapers([]);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (e) => {
    setFilterDepartment(e);
    setCurrentPage(1);
  };
  const handleStatusChange = (e) => {
    setFilterStatus(e);
    setCurrentPage(1);
  };
  const handleYearChange = (e) => {
    setFilterYear(e);
    setCurrentPage(1);
  };
  const handleTabChange = (e) => {
    setActiveTab(e);
    setCurrentPage(1);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedPapers.length === currentPapers.length) {
      setSelectedPapers([]);
    } else {
      setSelectedPapers(currentPapers.map((p) => p._id));
    }
  };

  // Handle single select
  const handleSelect = (id) => {
    if (selectedPapers.includes(id)) {
      setSelectedPapers(selectedPapers.filter((p) => p !== id));
    } else {
      setSelectedPapers([...selectedPapers, id]);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: {
        label: "Approved",
        icon: CheckCircle,
        color: "text-green-500 bg-green-50 dark:bg-green-900/20",
      },
      pending: {
        label: "Pending",
        icon: Clock,
        color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
      },
      rejected: {
        label: "Rejected",
        icon: XCircle,
        color: "text-red-500 bg-red-50 dark:bg-red-900/20",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const tabs = [
    { id: "all", label: "All", count: getTabCount("all") },
    { id: "pending", label: "Pending", count: getTabCount("pending") },
    { id: "approved", label: "Approved", count: getTabCount("approved") },
    { id: "rejected", label: "Rejected", count: getTabCount("rejected") },
  ];

  // ── Delete Functions with API Calls ─────────────────────────────

  // Single delete
  const handleSingleDelete = (paper) => {
    const paperName = paper.course?.name || paper._id;
    setConfirmModal({
      isOpen: true,
      title: "Delete Paper?",
      message: `Are you sure you want to delete "${paperName}"?`,
      changes: [],
      confirmText: "Yes, Delete",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        const loadingToast = showLoadingToast("Deleting paper...");

        try {
          const response = await axios.delete(
            `http://localhost:8000/api/admin/papers/${paper._id}`,
            { withCredentials: true },
          );
          dismissToast(loadingToast);

          if (response.data.success) {
            setPapers(papers.filter((p) => p._id !== paper._id));
            showSuccessToast("Paper deleted successfully!");
          } else {
            showErrorToast(response.data.message || "Failed to delete paper");
          }
        } catch (err) {
          dismissToast(loadingToast);
          showErrorToast(
            err.response?.data?.message || "Failed to delete paper",
          );
        } finally {
          setConfirmModal((prev) => ({
            ...prev,
            isOpen: false,
            isLoading: false,
          }));
        }
      },
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedPapers.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedPapers.length} Paper(s)?`,
      message: `Are you sure you want to delete ${selectedPapers.length} selected paper(s)?`,
      changes: [],
      confirmText: `Yes, Delete ${selectedPapers.length}`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        const loadingToast = showLoadingToast("Deleting papers...");

        try {
          const response = await axios.delete(
            "http://localhost:8000/api/admin/papers/bulk",
            {
              data: { ids: selectedPapers },
              withCredentials: true,
            },
          );
          dismissToast(loadingToast);

          if (response.data.success) {
            setPapers(papers.filter((p) => !selectedPapers.includes(p._id)));
            setSelectedPapers([]);
            showSuccessToast(
              `${response.data.deletedCount} paper(s) deleted successfully!`,
            );
          } else {
            showErrorToast(response.data.message || "Failed to delete papers");
          }
        } catch (err) {
          dismissToast(loadingToast);
          showErrorToast(
            err.response?.data?.message || "Failed to delete papers",
          );
        } finally {
          setConfirmModal((prev) => ({
            ...prev,
            isOpen: false,
            isLoading: false,
          }));
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Manage Papers
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-transparent text-sm text-gray-900 dark:text-white outline-none w-32 lg:w-48"
                />
              </div>
              <Link
                href="/admin/papers/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Paper
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Papers
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {papers.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Approved
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {papers.filter((p) => p.status === "approved").length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pending
              </p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {papers.filter((p) => p.status === "pending").length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rejected
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {papers.filter((p) => p.status === "rejected").length}
              </p>
            </div>
          </div>

          {/* Tabs Menu */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#4FC3FC] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 py-2">
                <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 transition-colors ${
                      viewMode === "table"
                        ? "bg-[#4FC3FC] text-white"
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    title="Table view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#4FC3FC] text-white"
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {selectedPapers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPapers.length} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <select
                  value={filterDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="all">All Departments</option>
                  {[
                    ...new Set(
                      papers.map((p) => p.department?.name).filter(Boolean),
                    ),
                  ].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="all">All Years</option>
                  {[...new Set(papers.map((p) => p.year).filter(Boolean))].map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ),
                  )}
                </select>

                <button
                  onClick={() => {
                    setFilterDepartment("all");
                    setFilterStatus("all");
                    setFilterYear("all");
                    setSearchQuery("");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  Clear All
                </button>

                <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
                  {filteredPapers.length} results
                </span>
              </div>
            )}

            {/* Papers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedPapers.length === currentPapers.length &&
                          currentPapers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Paper
                    </th>
                    {/* Course/Exam column - hidden on mobile */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Course / Exam
                    </th>
                    {/* Department column - hidden on tablet and below */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
                    {/* Status column - hidden on mobile */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentPapers.map((paper) => {
                    const statusBadge = getStatusBadge(paper.status);
                    const StatusIcon = statusBadge.icon;
                    const isPending = paper.status === "pending";

                    return (
                      <tr
                        key={paper._id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          selectedPapers.includes(paper._id)
                            ? "bg-[#4FC3FC]/5 dark:bg-[#4FC3FC]/10"
                            : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3 align-top pt-4">
                          <input
                            type="checkbox"
                            checked={selectedPapers.includes(paper._id)}
                            onChange={() => handleSelect(paper._id)}
                            className="rounded border-gray-300 dark:border-gray-600 mt-0.5"
                          />
                        </td>

                        {/* Paper Column - always visible, contains extra mobile info */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {/* Course Name */}
                            <Link
                              href={`/admin/papers/${paper._id}`}
                              className="font-medium text-gray-900 dark:text-white text-sm hover:text-[#4FC3FC] transition-colors"
                            >
                              {paper.course?.name || "Unknown Course"}
                            </Link>

                            {/* Instructor - always visible */}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {paper.instructor?.title}{" "}
                              {paper.instructor?.name || "Unknown Instructor"}
                            </p>

                            {/* ── Mobile-only details ── */}
                            <div className="sm:hidden space-y-0.5 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {paper.examType} • {paper.semester} {paper.year}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {paper.department?.name || "Unknown Department"}
                              </p>
                              {/* Mobile status badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusBadge.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Course / Exam - hidden on mobile */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {paper.examType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {paper.semester} {paper.year}
                            </p>
                          </div>
                        </td>

                        {/* Department - hidden on tablet and below */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {paper.department?.name || "Unknown"}
                          </span>
                        </td>

                        {/* Status - hidden on mobile */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isPending ? (
                              <Link
                                href={`/admin/papers/${paper._id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                <Shield className="w-4 h-4" />
                                <span className="hidden xs:inline">Verify</span>
                                <span className="xs:hidden">Review</span>
                              </Link>
                            ) : (
                              <>
                                <Link
                                  href={`/admin/papers/${paper._id}`}
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    paper.status === "rejected"
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "bg-[#4FC3FC] hover:bg-[#29b6f6] text-white"
                                  }`}
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden xs:inline">View</span>
                                </Link>
                                <Link
                                  href={`/admin/papers/${paper._id}/edit`}
                                  className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleSingleDelete(paper)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredPapers.length === 0 && !loading && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No papers found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || showFilters
                    ? "Try adjusting your search or filters"
                    : activeTab !== "all"
                      ? `No ${activeTab} papers available`
                      : "Start by adding your first paper"}
                </p>
                {!searchQuery && !showFilters && activeTab === "all" && (
                  <Link
                    href="/papers/new"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Paper
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredPapers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{endIndex}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> results
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#4FC3FC] text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Confirmation Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        changes={confirmModal.changes}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}
