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
  Calendar,
  BookOpen,
  Building,
  HardDrive,
  Flame,
  Activity,
  ChevronDown,
  Bell,
  Search,
  Menu,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Star,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RecentActivity from "@/components/RecentActivity";
import QuickActions from "@/components/QuickActions";

import StatsCard from "@/components/StatsCard";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalUsers: 0,
    totalDepartments: 0,
    totalSubjects: 0,
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

  // ── Format helpers ────────────────────────────────────────────
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

        // Fetch all stats from backend
        const response = await axios.get(
          "http://localhost:8000/api/papers/admin/dashboard/stats",
        );

        if (!cancelled && response.data.success) {
          setStats(response.data.data);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
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
          {/* ── Main Stats: 3 BIG cards + 2 small ────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* BIG: Total Papers */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Papers
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalPapers)}
                  </p>
                </div>
              </div>
            </div>

            {/* BIG: Total Users */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalUsers)}
                  </p>
                </div>
              </div>
            </div>

            {/* BIG: Pending Papers */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.pendingPapers)}
                  </p>
                </div>
              </div>
            </div>

            {/* Small: Departments */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Departments
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalDepartments)}
                  </p>
                </div>
              </div>
            </div>

            {/* Small: Subjects */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Subjects
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalSubjects)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Engagement Stats Row ────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Downloads
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalDownloads)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rejected
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.rejectedPapers)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                  <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monthly Uploads
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.monthlyUploads)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Storage Used
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
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
                          {paper.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {paper.courseCode} • {paper.subject}
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
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

                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-100 overflow-y-auto">
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
                            <Link
                              href={`/admin/papers/${activity.id}`}
                              className="text-[#4FC3FC] hover:underline"
                            >
                              {activity.paper}
                            </Link>
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

            <div className="xl:col-span-1">
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
