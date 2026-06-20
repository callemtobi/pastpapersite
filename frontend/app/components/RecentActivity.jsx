"use client";

import {
  LayoutDashboard,
  CheckCircle,
  FileText,
  Megaphone,
  Users,
  Download,
  Upload,
  Clock,
  XCircle,
  Settings,
  ChevronDown,
  Bell,
  Search,
  User,
  Menu,
  X,
  TrendingUp,
  Calendar,
  BookOpen,
  Link,
  LogOut,
  Eye,
} from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "upload",
      user: "John Doe",
      paper: "CS-401 Final Exam 2024",
      time: "2 minutes ago",
      icon: Upload,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: 2,
      type: "approval",
      user: "Sarah Smith",
      paper: "MATH-201 Midterm 2023",
      time: "15 minutes ago",
      icon: CheckCircle,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: 3,
      type: "download",
      user: "Mike Johnson",
      paper: "PHY-101 Final Exam 2024",
      time: "1 hour ago",
      icon: Download,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: 4,
      type: "rejection",
      user: "Admin",
      paper: "CHEM-301 Midterm 2024",
      time: "2 hours ago",
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${activity.bg}`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.user}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {activity.type === "upload" && "Uploaded"}
                  {activity.type === "approval" && "Approved"}
                  {activity.type === "download" && "Downloaded"}
                  {activity.type === "rejection" && "Rejected"} -{" "}
                  {activity.paper}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/admin/activity"
          className="text-sm text-[#4FC3FC] hover:text-[#29b6f6] font-medium"
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
}
