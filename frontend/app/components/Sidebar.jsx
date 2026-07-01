// components/Sidebar.jsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Download,
  Upload,
  UsersRound,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showSuccessToast } from "@/lib/toastConfig";

export default function Sidebar({ user, isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/download", label: "Download", icon: Download },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/about", label: "About Us", icon: UsersRound },
  ];

  const isActive = (path) => {
    if (path === "/download") {
      return pathname === path || pathname.startsWith(path + "/");
    }
    return pathname === path;
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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-lg bg-[#4FC3FC] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            PaperVault
          </span>
        </div>

        {/* ── User Info Section ──────────────────────────────────── */}
        {user ? (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4FC3FC] flex items-center justify-center text-white font-medium text-sm">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Login
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-[#4FC3FC] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom: User Actions ────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {user ? (
            <div className="space-y-2">
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name || "User"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <Link
                      href="/profile"
                      onClick={() => {
                        setShowDropdown(false);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => {
                        setShowDropdown(false);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Logout Button (direct) */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
