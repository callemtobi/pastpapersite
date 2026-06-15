"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import "../globals.css";
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
} from "lucide-react";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toastConfig";
import { navbarAnimation } from "@/lib/animations";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = () => {
    try {
      axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      showSuccessToast("You have been logged out.");

      router.push("/login");
    }
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

  // const isActive = (path) => pathname === path;
  const isActive = (path) => {
    if (path === "/download") {
      // Check if current path starts with "/download" (handles /download/123, /download/some-id, etc.)
      return pathname === path || pathname.startsWith(path + "/");
    }
    return pathname === path;
  };

  return (
    <>
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-white/20 text-foreground/50 hover:bg-black/10 hover:text-black/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
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

          {/* Mobile dropdown — sits just below the pill */}
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
                        // ? "bg-white/15 text-white"
                        // : "text-white/50 hover:bg-white/10 hover:text-white/80"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-full text-sm border-white/20 hover:bg-white/10 hover:text-white w-full transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </header>

        {/* Spacer so page content doesn't hide under the fixed navbar */}
        <div className="h-20" />
      </motion.nav>
    </>
  );
}
