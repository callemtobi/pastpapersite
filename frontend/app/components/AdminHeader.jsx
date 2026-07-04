// components/admin/AdminHeader.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showSuccessToast } from "@/lib/toastConfig";

export default function AdminHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/papers") return "Manage Papers";
    if (pathname === "/admin/users") return "Users";
    if (pathname === "/admin/academic-data") return "Academic Data";
    if (pathname === "/admin/announcements") return "Announcements";
    return "Admin";
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true },
      );
      showSuccessToast("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left - Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // Sidebar toggle function is now handled in the layout
              const sidebarEvent = new CustomEvent("toggleSidebar");
              window.dispatchEvent(sidebarEvent);
            }}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-900 dark:text-white outline-none w-32 lg:w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#4FC3FC] flex items-center justify-center text-white font-medium text-sm">
                {user?.initial || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "admin@papervault.com"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/admin/profile");
                  }}
                  className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/admin/settings");
                  }}
                  className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
