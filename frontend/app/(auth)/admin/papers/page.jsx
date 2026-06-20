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
} from "lucide-react";
import Link from "next/link";

export default function Papers() {
  const mockPapers = [
    {
      id: 1,
      title: "Advanced Machine Learning",
      courseCode: "CS-401",
      subject: "Computer Science",
      department: "Computer Science",
      instructor: "Prof. Sarah Johnson",
      year: "2024",
      semester: "Fall",
      examType: "Final Exam",
      status: "approved",
      downloads: 1247,
      pages: 12,
      createdAt: "2024-12-15",
      verified: true,
    },
    {
      id: 2,
      title: "Calculus III",
      courseCode: "MATH-301",
      subject: "Mathematics",
      department: "Mathematics",
      instructor: "Prof. Michael Chen",
      year: "2024",
      semester: "Spring",
      examType: "Midterm",
      status: "pending",
      downloads: 856,
      pages: 8,
      createdAt: "2024-12-14",
      verified: false,
    },
    {
      id: 3,
      title: "Quantum Physics",
      courseCode: "PHY-401",
      subject: "Physics",
      department: "Physics",
      instructor: "Dr. Emily Watson",
      year: "2023",
      semester: "Fall",
      examType: "Final Exam",
      status: "approved",
      downloads: 2341,
      pages: 15,
      createdAt: "2024-12-13",
      verified: true,
    },
    {
      id: 4,
      title: "Organic Chemistry",
      courseCode: "CHEM-301",
      subject: "Chemistry",
      department: "Chemistry",
      instructor: "Prof. David Kim",
      year: "2024",
      semester: "Fall",
      examType: "Midterm",
      status: "rejected",
      downloads: 432,
      pages: 10,
      createdAt: "2024-12-12",
      verified: false,
    },
    {
      id: 5,
      title: "Data Structures",
      courseCode: "CS-301",
      subject: "Computer Science",
      department: "Computer Science",
      instructor: "Prof. Alex Rivera",
      year: "2024",
      semester: "Spring",
      examType: "Final Exam",
      status: "approved",
      downloads: 1892,
      pages: 14,
      createdAt: "2024-12-11",
      verified: true,
    },
    {
      id: 6,
      title: "Linear Algebra",
      courseCode: "MATH-202",
      subject: "Mathematics",
      department: "Mathematics",
      instructor: "Prof. Lisa Wong",
      year: "2024",
      semester: "Fall",
      examType: "Final Exam",
      status: "pending",
      downloads: 634,
      pages: 9,
      createdAt: "2024-12-10",
      verified: false,
    },
    {
      id: 7,
      title: "Thermodynamics",
      courseCode: "PHY-301",
      subject: "Physics",
      department: "Physics",
      instructor: "Dr. Robert Brown",
      year: "2024",
      semester: "Spring",
      examType: "Midterm",
      status: "approved",
      downloads: 1023,
      pages: 11,
      createdAt: "2024-12-09",
      verified: true,
    },
    {
      id: 8,
      title: "Inorganic Chemistry",
      courseCode: "CHEM-401",
      subject: "Chemistry",
      department: "Chemistry",
      instructor: "Prof. Maria Garcia",
      year: "2023",
      semester: "Fall",
      examType: "Final Exam",
      status: "rejected",
      downloads: 289,
      pages: 13,
      createdAt: "2024-12-08",
      verified: false,
    },
  ];

  const [papers, setPapers] = useState(() => mockPapers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter papers based on search, filters, and tabs
  const getFilteredPapers = () => {
    let filtered = papers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (paper) => paper.department === filterDepartment,
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((paper) => paper.status === filterStatus);
    }

    // Year filter
    if (filterYear !== "all") {
      filtered = filtered.filter((paper) => paper.year === filterYear);
    }

    // Tab filter
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

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, filterDepartment, filterStatus, filterYear, activeTab]);

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
      setSelectedPapers(currentPapers.map((p) => p.id));
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

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (selectedPapers.length === 0) return;
    if (confirm(`Delete ${selectedPapers.length} selected paper(s)?`)) {
      setPapers(papers.filter((p) => !selectedPapers.includes(p.id)));
      setSelectedPapers([]);
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
              <div className="flex flex-wrap items-center gap-1 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                {/* View Toggle */}
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

                {/* Bulk Actions */}
                {selectedPapers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPapers.length} selected
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}

                {/* Filters Toggle */}
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
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
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
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
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
                    return (
                      <tr
                        key={paper.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          selectedPapers.includes(paper.id)
                            ? "bg-[#4FC3FC]/5 dark:bg-[#4FC3FC]/10"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedPapers.includes(paper.id)}
                            onChange={() => handleSelect(paper.id)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <Link
                              href={`/papers/${paper.id}`}
                              className="font-medium text-gray-900 dark:text-white text-sm hover:text-[#4FC3FC] transition-colors"
                            >
                              {paper.title}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {paper.instructor}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {paper.courseCode}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {paper.examType} • {paper.semester} {paper.year}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {paper.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/papers/${paper.id}`}
                              className="p-1.5 text-gray-400 hover:text-[#4FC3FC] rounded-lg hover:bg-[#4FC3FC]/10 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/papers/${paper.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${paper.title}"?`)) {
                                  setPapers(
                                    papers.filter((p) => p.id !== paper.id),
                                  );
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
    </div>
  );
}
