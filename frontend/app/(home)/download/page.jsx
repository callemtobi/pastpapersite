// app/(home)/download/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Filter,
  Calendar,
  BookOpen,
  Star,
  ChevronDown,
  FileText,
  Eye,
  Loader,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { resultsContainer, resultCard } from "@/lib/animations";
import axios from "axios";

export default function DownloadPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState([]);
  const [totalPapers, setTotalPapers] = useState(0);

  // ── Pagination state ────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data from backend with pagination and filters
  useEffect(() => {
    let cancelled = false;

    const getPapers = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", itemsPerPage);

        if (searchQuery) params.append("search", searchQuery);
        if (departmentFilter !== "all")
          params.append("department", departmentFilter);
        if (yearFilter !== "all") params.append("year", yearFilter);
        if (typeFilter !== "all") params.append("examType", typeFilter);
        if (subjectFilter !== "all") params.append("semester", subjectFilter);

        const response = await axios.get(
          `http://localhost:8000/api/papers?${params.toString()}`,
        );

        if (!cancelled) {
          if (response.data.success && response.data.papers) {
            const populatedPapers = response.data.papers.map((paper) => ({
              ...paper,
              courseName:
                paper.course?.name || paper.course || "Unknown Course",
              departmentName:
                paper.department?.name ||
                paper.department ||
                "Unknown Department",
              instructorName: paper.instructor?.name || "Unknown Instructor",
              instructorTitle: paper.instructor?.title || "",
            }));
            setPapers(populatedPapers);
            setTotalPapers(response.data.pagination?.total || 0);
          } else {
            setPapers([]);
            setTotalPapers(0);
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
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    departmentFilter,
    yearFilter,
    typeFilter,
    subjectFilter,
  ]);

  // ── Reset page when filters change ─────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, yearFilter, typeFilter, subjectFilter]);

  // ── Pagination calculations ────────────────────────────────────
  const totalPages = Math.ceil(totalPapers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalPapers);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 770);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Get unique departments for filter
  const departments = [
    ...new Set(papers.map((p) => p.department?.name || p.departmentName)),
  ].filter(Boolean);

  return (
    <div className={`max-w-4xl mx-auto space-y-6`}>
      {/* Header */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Browse Papers
          </h1>
          <p className="text-muted-foreground">
            Search and download past examination papers
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <motion.input
                type="text"
                placeholder="Search by course, department, or instructor..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="border border-border-light bg-input-bg w-full pl-12 pr-4 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="border border-border-light bg-primary-button-bg text-input-text inline-flex items-center gap-2 px-6 h-12 rounded-lg font-medium transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </motion.button>
          </motion.div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-border-light rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="border border-border-light bg-input-bg w-full px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="border border-border-light bg-input-bg w-full px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Years</option>
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
                    <label className="text-sm font-medium">Exam Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="border border-border-light bg-input-bg w-full px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="Final Exam">Final Exam</option>
                      <option value="Midterm">Midterm</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="border border-border-light bg-input-bg w-full px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Semesters</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSubjectFilter("all");
                      setYearFilter("all");
                      setTypeFilter("all");
                      setDepartmentFilter("all");
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {totalPapers > 0 ? startIndex : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {totalPapers > 0 ? endIndex : 0}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalPapers}</span>{" "}
            papers
          </p>
        </motion.div>
      </div>

      {/* Papers Grid */}
      <motion.div
        variants={resultsContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6"
      >
        {papers.map((paper) => {
          const courseName =
            paper.course?.name || paper.courseName || "Unknown Course";
          const departmentName =
            paper.department?.name ||
            paper.departmentName ||
            "Unknown Department";
          const instructorName =
            paper.instructor?.name ||
            paper.instructorName ||
            "Unknown Instructor";
          const instructorTitle =
            paper.instructor?.title || paper.instructorTitle || "";

          return (
            <motion.div
              key={paper._id}
              variants={resultCard}
              className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 bg-amber-200">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {courseName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-gray-400">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {instructorTitle} {instructorName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {paper.examType}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {paper.semester} {paper.year}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                        <Calendar className="w-4 h-4 stroke-[1.5]" />
                        {paper.semester} {paper.year}
                      </span>

                      <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                        <Download className="w-4 h-4 stroke-[1.5]" />
                        {paper.downloads || 0} downloads
                      </span>

                      <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                        <Star className="w-4 h-4 stroke-[1.5] fill-yellow-400 text-yellow-400" />
                        {paper.rating || 0}
                      </span>

                      <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                        <FileText className="w-4 h-4 stroke-[1.5]" />
                        {paper.pages || 0} pages
                      </span>

                      <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                        <Building className="w-4 h-4 stroke-[1.5]" />
                        {departmentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 lg:items-end">
                    <motion.button
                      onClick={() => {
                        router.push(`/download/${paper._id}`);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-xl bg-[#DDE3EA] dark:bg-gray-700 hover:bg-[#DDE3EA]/80 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-all duration-200 w-full sm:w-auto min-w-25 sm:min-w-30 md:min-w-35"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">View</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <Loader className="w-8 h-8 animate-spin text-[#4FC3FC]" />
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Loading papers...
          </span>
        </motion.div>
      )}

      {/* Empty State */}
      {papers.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border border-border-light rounded-lg shadow-sm"
        >
          <div className="p-12 text-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4"
            >
              <Search className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No papers found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {totalPapers > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Showing <span className="font-medium">{startIndex}</span> to{" "}
              <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{totalPapers}</span> results
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
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
        </motion.div>
      )}
    </div>
  );
}
