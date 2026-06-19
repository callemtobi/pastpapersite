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
} from "lucide-react";
import Loading from "./loading";
import CountUp from "react-countup";
import { motion } from "motion/react";
import {
  fadeUp,
  activityContainer,
  activityItem,
  container,
  item,
} from "@/lib/animations";

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
  { label: "Total Papers", value: 2547 },
  { label: "Downloads Today", value: 1234 },
  { label: "Active Users", value: 856 },
];

export default function Main() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-12">
      {/* Hero Section - Minimalistic */}
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
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
              duration: 0.8,
            }}
            className="text-base sm:text-lg max-w-xl mx-auto px-4"
          >
            Your gateway to academic excellence
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.8,
              duration: 0.6,
            }}
            className="relative"
          >
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 h-11 sm:h-12 md:h-14 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              className="border border-border-light bg-input-bg w-full pl-9 sm:pl-12 pr-3 sm:pr-4 h-11 sm:h-12 md:h-14 text-sm sm:text-base rounded-xl sm:rounded-2xl bg- focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            />
          </motion.div>
        </div>

        {/* Quick Actions - Minimalistic */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1,
            duration: 0.7,
          }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 px-4 sm:px-0"
        >
          <Link href={"/download"} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto gap-2 bg-[#4FC3F7] hover:bg-[#4FC3F7]/80 active:scale-95 text-white px-4 sm:px-6 md:px-8 h-10 sm:h-11 md:h-12 rounded-xl inline-flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Browse Papers</span>
            </button>
          </Link>
          <Link href={"/upload"} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto gap-2 px-4 sm:px-6 md:px-8 h-10 sm:h-11 md:h-12 rounded-xl bg-[#DDE3EA] dark:bg-gray-700 hover:bg-[#DDE3EA]/80 dark:hover:bg-gray-600 active:scale-95 inline-flex items-center justify-center font-medium text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Upload Paper</span>
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Stats - Minimal Design */}
      <motion.div
        // initial={{
        //   opacity: 0,
        //   y: 60,
        // }}
        // whileInView={{
        //   opacity: 1,
        //   y: 0,
        // }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.7,
        }}
        className="grid grid-cols-3 gap-4 sm:gap-6"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
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

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <motion.h2
            initial={{
              opacity: 0,
              x: -40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
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
              viewport={{
                once: true,
                amount: 0.2,
              }}
              className="divide-y divide-border-light"
            >
              {recentVisitors.map((visitor) => (
                <motion.div
                  key={visitor.id}
                  variants={activityItem}
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          className="border border-border-light rounded-lg shadow-sm bg-background-secondary"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
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
              <motion.div
                className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="border border-border-light rounded-lg shadow-sm bg-background-secondary"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
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
              <motion.div
                className="p-3 rounded-full bg-green-50 dark:bg-green-900/20"
                whileHover={{ scale: 1.1, rotate: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
