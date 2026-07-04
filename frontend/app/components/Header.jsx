// components/Header.jsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import "@/css/globals.css";
import {
  GraduationCap,
  Home,
  Download,
  Upload,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  UsersRound,
  User,
  ChevronDown,
} from "lucide-react";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toastConfig";
import { navbarAnimation } from "@/lib/animations";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = async () => {
    setShowUserDropdown(false);
    logout();
    // try {
    //   await axios.post(
    //     "http://localhost:8000/api/auth/logout",
    //     {},
    //     { withCredentials: true },
    //   );
    //   showSuccessToast("You have been logged out.");
    //   router.push("/home");
    // } catch (err) {
    //   console.error("Logout error:", err);
    //   showErrorToast("Logout error");
    //   router.push("/login");
    // }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

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

  if (loading) {
    return <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />;
    // or reuse your existing SkeletonUI.jsx here
  }

  return (
    <motion.nav variants={navbarAnimation} initial="hidden" animate="visible">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50">
        {/* Main navbar pill */}
        <div
          className={`rounded-full px-2 py-3 flex items-center gap-2 shadow-lg border ${
            isDark
              ? "bg-gray-600 text-white border-[#4FC3F7]"
              : "bg-white text-black border-gray-200"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 pl-1 pr-3 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm cursor-pointer font-semibold text-gray-900 dark:text-white hidden sm:block whitespace-nowrap">
              PaperVault
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-[#4FC3F7]/10 text-[#4FC3F7]"
                      : "text-foreground/60 hover:bg-[#DDE3EA]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-foreground/50 hover:bg-black/10 hover:text-black/80 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* ── User Section ────────────────────────────────────── */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#4FC3FC] flex items-center justify-center text-white font-medium text-xs">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
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
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#4FC3FC] hover:bg-[#29b6f6] text-white transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-foreground/60 hover:bg-white/10 hover:text-white/80 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            {user && (
              <div className="w-7 h-7 rounded-full bg-[#4FC3FC] flex items-center justify-center text-white font-medium text-xs">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-foreground/60 hover:bg-white/10 hover:text-white/80 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <nav className="px-2 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm transition-colors ${
                      isActive(item.path)
                        ? "bg-[#4FC3F7]/10 text-[#4FC3F7]"
                        : "text-foreground/60 hover:bg-[#DDE3EA]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-full text-sm bg-[#4FC3FC] hover:bg-[#29b6f6] text-white w-full transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-20" />
    </motion.nav>
  );
}
