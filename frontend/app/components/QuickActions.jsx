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

export default function QuickActions() {
  const actions = [
    { label: "Review Papers", icon: CheckCircle, color: "text-green-500" },
    { label: "Upload Paper", icon: Upload, color: "text-blue-500" },
    { label: "Send Announcement", icon: Megaphone, color: "text-purple-500" },
    { label: "Manage Users", icon: Users, color: "text-orange-500" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#4FC3FC] hover:bg-[#4FC3FC]/5 transition-all group"
            >
              <Icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-xs text-gray-600 dark:text-gray-300 text-center group-hover:text-[#4FC3FC]">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
