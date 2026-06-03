"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Upload,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import Loading from "./loading";

// Mock data for recent activity
const recentVisitors = [
  {
    id: 1,
    name: "Alex Chen",
    action: "downloaded",
    paper: "Calculus II Final 2025",
    time: "2 min ago",
    avatar: "AC",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    action: "uploaded",
    paper: "Data Structures Midterm",
    time: "5 min ago",
    avatar: "SJ",
  },
  {
    id: 3,
    name: "Mike Davis",
    action: "downloaded",
    paper: "Organic Chemistry Quiz 3",
    time: "12 min ago",
    avatar: "MD",
  },
  {
    id: 4,
    name: "Emma Wilson",
    action: "downloaded",
    paper: "Linear Algebra Final",
    time: "18 min ago",
    avatar: "EW",
  },
  {
    id: 5,
    name: "James Brown",
    action: "uploaded",
    paper: "Physics Thermodynamics",
    time: "25 min ago",
    avatar: "JB",
  },
  {
    id: 6,
    name: "Lisa Martinez",
    action: "downloaded",
    paper: "Microeconomics Final 2025",
    time: "32 min ago",
    avatar: "LM",
  },
];

const stats = [
  { label: "Total Papers", value: "2,547" },
  { label: "Downloads Today", value: "1,234" },
  { label: "Active Users", value: "856" },
];

// async function getData() {
//   await new Promise((resolve) => setTimeout(resolve, 2000));

//   return [];
// }

export default function Main() {
  const [searchQuery, setSearchQuery] = useState("");
  // Loading
  // const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   getData().then((result) => {
  //     setData(result);
  //     setLoading(false);
  //   });
  // }, []);

  // if (loading) return <Loading />;

  return (
    <div className="space-y-12">
      {/* Hero Section - Minimalistic */}
      <div className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
            Pasty Paperyyy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Your gateway to academic excellence
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 h-14 text-base border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link href={"/download"}>
            {/* <button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl inline-flex items-center font-medium transition-colors"> */}
            <button className="gap-2 bg-[#4FC3F7] hover:bg-[#4FC3F7]/70 border-gray-300 text-white px-8 h-12 rounded-xl inline-flex items-center font-medium transition-colors">
              <Download className="w-5 h-5" />
              Browse Papers
            </button>
          </Link>
          <Link href={"/upload"}>
            <button className="gap-2 px-8 h-12 rounded-xl  bg-[#DDE3EA] dark:border-gray-600 hover:bg-[#DDE3EA]/70 dark:hover:bg-gray-900 inline-flex items-center font-medium text-gray-900 dark:text-white transition-colors">
              <Upload className="w-5 h-5" />
              Upload Paper
            </button>
          </Link>
        </div>
      </div>

      {/* Stats - Minimal Design */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-6 rounded-lg bg-background-secondary shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-500" />
        </div>

        <div className="border border-border-light rounded-lg shadow-sm bg-background-secondary">
          <div className="p-0">
            <div className="divide-y divide-border-light">
              {recentVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="p-4 hover:bg-background dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        {visitor.avatar}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground text-sm">
                          {visitor.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {visitor.action}
                        </span>
                        {visitor.action === "uploaded" ? (
                          <ArrowUpRight className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {visitor.paper}
                      </p>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 shrink-0">
                      {visitor.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border-light rounded-lg shadow-sm bg-background-secondary">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Downloads
                </p>
                <p className="text-2xl font-bold text-foreground">847</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12% from yesterday
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border-light rounded-lg shadow-sm bg-background-secondary">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Uploads
                </p>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +8% from yesterday
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
