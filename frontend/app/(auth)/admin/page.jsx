// app/admin/page.jsx
"use client";

import { useState } from "react";
import {
  FileText,
  Users,
  Download,
  Clock,
  ChevronDown,
  Bell,
  Search,
  Menu,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Import components
import RecentActivity from "@/components/RecentActivity";
import QuickActions from "@/components/QuickActions";
import StatsCard from "@/components/StatsCard";
// import { useSidebar } from "@/app/context/SidebarContext";

// ── Main Dashboard Page ────────────────────────────────────────
export default function AdminDashboard() {
  // const { setSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Page Content */}
        <main className="p-4 sm:p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard
              icon={FileText}
              label="Total Papers"
              value="2,847"
              change={12}
              color="blue"
            />
            <StatsCard
              icon={Clock}
              label="Pending Approval"
              value="23"
              change={-5}
              color="orange"
            />
            <StatsCard
              icon={Users}
              label="Total Users"
              value="1,526"
              change={8}
              color="green"
            />
            <StatsCard
              icon={Download}
              label="Total Downloads"
              value="45,892"
              change={15}
              color="purple"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Papers by Department - Placeholder Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Papers by Department
                </h3>
                <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
              </div>
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chart visualization here</p>
                  <p className="text-xs">(Recharts or Chart.js)</p>
                </div>
              </div>
            </div>

            {/* Upload Trends - Placeholder Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Trends
                </h3>
                <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <option>This week</option>
                  <option>This month</option>
                  <option>This year</option>
                </select>
              </div>
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chart visualization here</p>
                  <p className="text-xs">(Recharts or Chart.js)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2/3 of space */}
            <div className="xl:col-span-2">
              <RecentActivity />
            </div>

            {/* Quick Actions - Takes 1/3 of space */}
            <div className="xl:col-span-1">
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
