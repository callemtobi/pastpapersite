"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Upload,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  User,
  FileText,
  Users,
  Clock,
  Activity,
  BookOpen,
} from "lucide-react";
import Loading from "./loading";
import CountUp from "react-countup";
import { motion } from "motion/react";
import axios from "axios";
import {
  fadeUp,
  activityContainer,
  activityItem,
  container,
  item,
} from "@/lib/animations";

export default function Main() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalDownloads: 0,
    monthlyDownloads: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // ── Fetch dashboard data ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/auth/dashboard/stats",
          { withCredentials: true },
        );

        if (!cancelled && response.data.success) {
          setStats({
            totalPapers: response.data.data?.totalPapers || 0,
            totalDownloads: response.data.data?.totalDownloads || 0,
            monthlyDownloads: response.data.data?.monthlyDownloads || 0,
          });
          setRecentActivity(response.data.data?.recentActivity || []);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error fetching dashboard data";
        if (!cancelled) setError(errorMessage);
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Search functionality ──────────────────────────────────────
  useEffect(() => {
    const searchPapers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8000/api/papers?search=${encodeURIComponent(searchQuery)}`,
        );
        if (response.data.success) {
          setSearchResults(response.data.papers || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(searchPapers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    return days + "d ago";
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#4FC3FC] text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Stats for display ─────────────────────────────────────────
  const displayStats = [
    { label: "Total Papers", value: stats.totalPapers },
    { label: "Total Downloads", value: stats.totalDownloads },
    { label: "Monthly Downloads", value: stats.monthlyDownloads },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 sm:space-y-8 py-8 sm:py-12">
        <div className="space-y-3 sm:space-y-4">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight"
          >
            Pasty Paperyyy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base sm:text-lg max-w-xl mx-auto px-4"
          >
            Your gateway to academic excellence
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative"
          >
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 h-11 sm:h-12 md:h-14 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            />

            {/* Search Results Dropdown */}
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50">
                {searchResults.map((paper) => (
                  <Link
                    key={paper._id}
                    href={`/download/${paper._id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {paper.course?.name || "Unknown Course"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {paper.department?.name || "N/A"} • {paper.examType}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {paper.downloads || 0} downloads
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 px-4 sm:px-0"
        >
          <Link href="/download" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto gap-2 bg-[#4FC3F7] hover:bg-[#4FC3F7]/80 active:scale-95 text-white px-4 sm:px-6 md:px-8 h-10 sm:h-11 md:h-12 rounded-xl inline-flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Browse Papers</span>
            </button>
          </Link>
          <Link href="/upload" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto gap-2 px-4 sm:px-6 md:px-8 h-10 sm:h-11 md:h-12 rounded-xl bg-[#DDE3EA] dark:bg-gray-700 hover:bg-[#DDE3EA]/80 dark:hover:bg-gray-600 active:scale-95 inline-flex items-center justify-center font-medium text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Upload Paper</span>
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Stats - From Database */}
      <motion.div
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="grid grid-cols-3 gap-4 sm:gap-6"
      >
        {displayStats.map((stat, index) => (
          <motion.div
            key={index}
            className="text-center p-6 rounded-lg bg-background-secondary shadow-sm hover:shadow-md transition-shadow duration-200"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
              <CountUp
                start={0}
                end={stat.value}
                duration={2}
                separator=","
                autoAnimate
                autoAnimateOnce
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Activity Summary ── Replace with "Popular Papers" ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-xl font-semibold text-foreground"
          >
            📚 Popular Papers
          </motion.h2>
          <Link
            href="/download"
            className="text-sm text-[#4FC3FC] hover:text-[#29b6f6] transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentActivity.slice(0, 4).map((activity, index) => (
            <motion.div
              key={index}
              className="border border-border-light rounded-lg shadow-sm bg-background-secondary p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {activity.paper || "Unknown Paper"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.user || "Anonymous"} • {activity.type || "N/A"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {getTimeAgo(activity.time)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {activity.downloads || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(activity.time)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {recentActivity.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No recent papers available</p>
          </div>
        )}
      </div>

      {/* ── Recent Activity (Replaces Activity Summary) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-xl font-semibold text-foreground"
          >
            Recent Activity
          </motion.h2>
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-500" />
        </div>

        <div className="border border-border-light rounded-lg shadow-sm bg-background-secondary">
          <div className="p-0">
            <motion.div
              variants={activityContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="divide-y divide-border-light"
            >
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 6).map((activity, index) => (
                  <motion.div
                    key={index}
                    variants={activityItem}
                    className="p-4 hover:bg-background dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          {activity.user?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground text-sm">
                            {activity.user || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {activity.type === "upload"
                              ? "uploaded"
                              : "downloaded"}
                          </span>
                          {activity.type === "upload" ? (
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {activity.paper || "Unknown Paper"}
                        </p>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400 shrink-0">
                        {getTimeAgo(activity.time)}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No recent activity</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
