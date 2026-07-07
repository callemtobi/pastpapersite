// app/admin/page.jsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Users,
  Clock,
  Download,
  TrendingUp,
  BookOpen,
  Building,
  HardDrive,
  Flame,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  User,
  ShoppingBag,
  Truck,
  Monitor,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

// ── SVG Background Components ────────────────────────────────────
const ChartSvg1 = () => (
  <svg
    className="absolute bottom-0 right-0 opacity-10"
    width="120"
    height="80"
    viewBox="0 0 120 80"
  >
    <polyline
      points="0,60 20,40 40,50 60,20 80,30 100,10 120,20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <polyline
      points="0,75 20,55 40,65 60,35 80,45 100,25 120,35"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <circle cx="60" cy="20" r="3" fill="currentColor" />
    <circle cx="100" cy="10" r="3" fill="currentColor" />
  </svg>
);

const ChartSvg2 = () => (
  <svg
    className="absolute bottom-0 right-0 opacity-10"
    width="120"
    height="80"
    viewBox="0 0 120 80"
  >
    <rect x="0" y="40" width="15" height="40" rx="2" fill="currentColor" />
    <rect x="20" y="25" width="15" height="55" rx="2" fill="currentColor" />
    <rect x="40" y="50" width="15" height="30" rx="2" fill="currentColor" />
    <rect x="60" y="15" width="15" height="65" rx="2" fill="currentColor" />
    <rect x="80" y="35" width="15" height="45" rx="2" fill="currentColor" />
    <rect x="100" y="5" width="15" height="75" rx="2" fill="currentColor" />
  </svg>
);

const ChartSvg3 = () => (
  <svg
    className="absolute bottom-0 right-0 opacity-10"
    width="120"
    height="80"
    viewBox="0 0 120 80"
  >
    <path
      d="M0,60 Q20,30 40,50 Q60,20 80,40 Q100,10 120,30 L120,80 L0,80 Z"
      fill="currentColor"
    />
    <path
      d="M0,70 Q30,50 60,60 Q90,40 120,55 L120,80 L0,80 Z"
      fill="currentColor"
      opacity="0.5"
    />
  </svg>
);

const ChartSvg4 = () => (
  <svg
    className="absolute bottom-0 right-0 opacity-10"
    width="120"
    height="80"
    viewBox="0 0 120 80"
  >
    <circle
      cx="60"
      cy="40"
      r="35"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
    />
    <circle
      cx="60"
      cy="40"
      r="35"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeDasharray="175 220"
      strokeDashoffset="0"
      transform="rotate(-90 60 40)"
    />
    <circle
      cx="60"
      cy="40"
      r="25"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeDasharray="100 157"
      strokeDashoffset="0"
      transform="rotate(-90 60 40)"
      opacity="0.5"
    />
  </svg>
);

const ChartSvg5 = () => (
  <svg
    className="absolute bottom-0 right-0 opacity-10"
    width="120"
    height="80"
    viewBox="0 0 120 80"
  >
    <polyline
      points="0,70 15,60 30,65 45,45 60,55 75,35 90,50 105,25 120,40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <polyline
      points="0,75 15,65 30,70 45,50 60,60 75,40 90,55 105,30 120,45"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
  </svg>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalUsers: 0,
    totalDepartments: 0,
    totalCourses: 0,
    totalDownloads: 0,
    pendingPapers: 0,
    rejectedPapers: 0,
    monthlyUploads: 0,
    monthlyDownloads: 0,
    totalStorage: 0,
    topPapers: [],
    recentActivity: [],
  });
  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const formatStorage = (bytes) => {
    if (!bytes) return "0 MB";
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " Bytes";
  };

  const getTimeAgo = (date) => {
    const diff = time - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    return days + "d ago";
  };

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ── Fetch all dashboard data ──────────────────────────────
        const [statsRes, topPapersRes, activityRes] = await Promise.all([
          axios.get("http://localhost:8000/api/admin/dashboard/stats", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8000/api/admin/dashboard/top-downloads", {
            withCredentials: true,
          }),
          axios.get(
            "http://localhost:8000/api/admin/dashboard/recent-activity",
            {
              withCredentials: true,
            },
          ),
        ]);

        if (!cancelled) {
          if (statsRes.data.success) {
            setStats((prev) => ({
              ...prev,
              ...statsRes.data.data,
            }));
          }

          if (topPapersRes.data.success) {
            setStats((prev) => ({
              ...prev,
              topPapers: topPapersRes.data.data || [],
            }));
          }

          if (activityRes.data.success) {
            setStats((prev) => ({
              ...prev,
              recentActivity: activityRes.data.data || [],
            }));
          }
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

    fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4FC3FC] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        <main className="p-4 sm:p-6 space-y-6">
          {/* ── Welcome Section ───────────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Here&apos;s what&apos;s happening with your platform
              today.
            </p>
          </div>

          {/* ── Stats Grid with SVG Backgrounds ───────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Papers */}
            <div className="relative bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm p-5 overflow-hidden">
              <ChartSvg1 />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total Papers
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatNumber(stats.totalPapers)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />+
                    {formatNumber(stats.totalPapers * 0.12)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="relative bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm p-5 overflow-hidden">
              <ChartSvg2 />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatNumber(stats.totalUsers)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />+
                    {formatNumber(stats.totalUsers * 0.08)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Pending Papers */}
            <div className="relative bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm p-5 overflow-hidden">
              <ChartSvg3 />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatNumber(stats.pendingPapers)}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />-
                    {formatNumber(stats.pendingPapers * 0.15)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Total Downloads */}
            <div className="relative bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm p-5 overflow-hidden">
              <ChartSvg4 />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Total Downloads
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatNumber(stats.totalDownloads)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />+
                    {formatNumber(stats.totalDownloads * 0.18)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Second Row: 5 Stats ───────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm p-4 overflow-hidden">
              <ChartSvg5 />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Departments
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalDepartments)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-4 overflow-hidden">
              <ChartSvg1 />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Courses
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalCourses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-linear-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm p-4 overflow-hidden">
              <ChartSvg2 />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    Rejected
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.rejectedPapers)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-linear-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20 rounded-xl border border-cyan-200 dark:border-cyan-800 shadow-sm p-4 overflow-hidden">
              <ChartSvg3 />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                    Monthly Uploads
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.monthlyUploads)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/20 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 overflow-hidden">
              <ChartSvg4 />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Storage Used
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatStorage(stats.totalStorage)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Top Downloaded Papers ────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Downloaded Papers
                </h3>
              </div>
              <Link
                href="/admin/papers"
                className="text-sm text-[#4FC3FC] hover:text-[#29b6f6]"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {stats.topPapers && stats.topPapers.length > 0 ? (
                stats.topPapers.map((paper, index) => (
                  <div
                    key={paper._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {paper.course?.name || "Unknown Course"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {paper.course?.department?.name || "N/A"} •{" "}
                          {paper.downloads} downloads
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber(paper.downloads)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No papers found
                </p>
              )}
            </div>
          </div>

          {/* ── Recent Activity ───────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <span className="text-xs text-gray-400">
                  {stats.recentActivity?.length || 0} activities
                </span>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          activity.type === "upload"
                            ? "bg-green-50 dark:bg-green-900/20"
                            : activity.type === "approval"
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : activity.type === "rejection"
                                ? "bg-red-50 dark:bg-red-900/20"
                                : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        {activity.type === "upload" && (
                          <FileText className="w-4 h-4 text-green-500" />
                        )}
                        {activity.type === "approval" && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {activity.type === "rejection" && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {activity.type === "download" && (
                          <Download className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">
                            {activity.user || "System"}
                          </span>{" "}
                          {activity.type === "upload"
                            ? "uploaded"
                            : activity.type === "approval"
                              ? "approved"
                              : activity.type === "rejection"
                                ? "rejected"
                                : "downloaded"}{" "}
                          {/* <Link
                            href={`/admin/papers/${activity.id}`}
                            className="text-[#4FC3FC] hover:underline"
                          > */}
                          {activity.paper}
                          {/* </Link> */}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {getTimeAgo(activity.time)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
