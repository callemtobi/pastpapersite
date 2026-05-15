"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

const allPapers = [
  {
    id: 1,
    title: "Calculus II - Final Exam 2025",
    course: "MATH 2420",
    subject: "Mathematics",
    year: "2025",
    semester: "Spring",
    type: "Final Exam",
    downloads: 234,
    rating: 4.8,
    pages: 8,
  },
  {
    id: 2,
    title: "Data Structures - Midterm 2024",
    course: "CS 3450",
    subject: "Computer Science",
    year: "2024",
    semester: "Fall",
    type: "Midterm",
    downloads: 456,
    rating: 4.9,
    pages: 12,
  },
  {
    id: 3,
    title: "Organic Chemistry - Quiz 3",
    course: "CHEM 3010",
    subject: "Chemistry",
    year: "2025",
    semester: "Spring",
    type: "Quiz",
    downloads: 189,
    rating: 4.6,
    pages: 4,
  },
  {
    id: 4,
    title: "Linear Algebra - Final 2024",
    course: "MATH 3400",
    subject: "Mathematics",
    year: "2024",
    semester: "Fall",
    type: "Final Exam",
    downloads: 312,
    rating: 4.7,
    pages: 10,
  },
  {
    id: 5,
    title: "Algorithms - Practice Set",
    course: "CS 4200",
    subject: "Computer Science",
    year: "2025",
    semester: "Spring",
    type: "Practice",
    downloads: 287,
    rating: 4.5,
    pages: 15,
  },
  {
    id: 6,
    title: "Thermodynamics - Midterm",
    course: "PHYS 2500",
    subject: "Physics",
    year: "2024",
    semester: "Fall",
    type: "Midterm",
    downloads: 156,
    rating: 4.4,
    pages: 7,
  },
  {
    id: 7,
    title: "Microeconomics - Final 2025",
    course: "ECON 2010",
    subject: "Economics",
    year: "2025",
    semester: "Spring",
    type: "Final Exam",
    downloads: 223,
    rating: 4.8,
    pages: 9,
  },
  {
    id: 8,
    title: "Digital Logic Design - Quiz 2",
    course: "ENG 2300",
    subject: "Engineering",
    year: "2024",
    semester: "Fall",
    type: "Quiz",
    downloads: 198,
    rating: 4.3,
    pages: 5,
  },
];

export default function DownloadPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const filteredPapers = allPapers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" || paper.subject === subjectFilter;
    const matchesYear = yearFilter === "all" || paper.year === yearFilter;
    const matchesType = typeFilter === "all" || paper.type === typeFilter;

    return matchesSearch && matchesSubject && matchesYear && matchesType;
  });

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

  return (
    <div className={`max-w-4xl mx-auto space-y-6`}>
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Browse Papers
          </h1>
          <p className="text-muted-foreground">
            Search and download past examination papers
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course code, title, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-6 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white font-medium transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Subject
                    </label>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Subjects</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Economics">Economics</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Year
                    </label>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Years</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="Final Exam">Final Exam</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Practice">Practice</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSubjectFilter("all");
                      setYearFilter("all");
                      setTypeFilter("all");
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredPapers.length}
            </span>{" "}
            papers
          </p>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 bg-amber-200">
                        <BookOpen className="w-5 h-5 text-primary " />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {paper.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-gray-400">
                          <div className="bg-primary text-gray-400">
                            {paper.course}
                          </div>
                          <div variant="outline">{paper.subject}</div>
                          <div variant="outline">{paper.type}</div>
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
                      {paper.downloads} downloads
                    </span>

                    <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                      <Star className="w-4 h-4 stroke-[1.5] fill-yellow-400 text-yellow-400" />
                      {paper.rating}
                    </span>

                    <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                      <FileText className="w-4 h-4 stroke-[1.5]" />
                      {paper.pages} pages
                    </span>

                    <span className="flex items-center gap-1 shadow-sm rounded-full p-3 py-1">
                      <BookOpen className="w-4 h-4 stroke-[1.5]" />
                      {paper.subject}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 lg:items-end">
                  <button className="gap-2 px-8 h-12 w-40 rounded-xl bg-[#4FC3F7] hover:bg-[#4FC3F7]/70 border-gray-300 text-white inline-flex items-center font-medium transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="gap-2 px-8 h-12 w-40 rounded-xl bg-[#DDE3EA] dark:border-gray-600 hover:bg-[#DDE3EA]/70 dark:hover:bg-gray-900 inline-flex items-center font-medium text-gray-900 dark:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <div className="border-border/50 shadow-sm">
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No papers found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
