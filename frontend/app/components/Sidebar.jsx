"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  User,
  BookOpen,
  LogOut,
  GraduationCap,
  Mail,
  Home,
  Sparkles,
  Settings,
  Users,
} from "lucide-react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "@/lib/toastConfig";
import { useAuth } from "../context/AuthContext";

// ── SVG Decorative Image ─────────────────────────────────────────
const DecorativeSvg = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      fill="#4FC3FC"
      opacity="0.1"
    />
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      stroke="#4FC3FC"
      strokeWidth="1.5"
      opacity="0.2"
    />
    <path
      d="M12 20L17 15L22 20L27 15"
      stroke="#4FC3FC"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 25L17 20L22 25L27 20"
      stroke="#4FC3FC"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
    <circle cx="20" cy="20" r="2" fill="#4FC3FC" opacity="0.3" />
  </svg>
);

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    {
      section: "Main",
      items: [
        {
          path: "/admin",
          label: "Home",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      section: "Management",
      items: [
        {
          path: "/admin/papers",
          label: "Papers",
          icon: FileText,
        },
        {
          path: "/admin/users",
          label: "Users",
          icon: Users,
        },
        {
          path: "/admin/academic-data",
          label: "Academic Data",
          icon: GraduationCap,
        },
      ],
    },
    {
      section: "System",
      items: [
        {
          path: "/admin/announcements",
          label: "Announcements",
          icon: Megaphone,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true },
      );
      showSuccessToast("You have been logged out.");
      router.push("/home");
    } catch (err) {
      console.error("Logout error:", err);
      showErrorToast("Logout error");
      router.push("/login");
    }
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return pathname === path;
    }
    return pathname.startsWith(path);
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
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#4FC3FC] flex items-center justify-center shadow-lg shadow-[#4FC3FC]/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            PaperVault
          </span>
          <span className="text-xs bg-[#4FC3FC]/10 text-[#4FC3FC] px-2 py-0.5 rounded-full ml-auto border border-[#4FC3FC]/20">
            Admin
          </span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {menuItems.map((section, sectionIndex) => (
            <div key={section.section}>
              {/* Section Header */}
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {section.section}
                </span>
                <div className="flex-1 h-px bg-linear-to-r from-gray-200 dark:from-gray-700 to-transparent" />
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        active
                          ? "bg-[#4FC3FC] text-white shadow-md shadow-[#4FC3FC]/20"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[#4FC3FC]/10 text-[#4FC3FC]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Separator Line with Box Shadow */}
              {sectionIndex < menuItems.length - 1 && (
                <div className="relative mt-4">
                  <div className="h-px bg-linear-to-r from-gray-200 dark:from-gray-700 via-gray-300 dark:via-gray-600 to-gray-200 dark:to-gray-700" />
                  <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-[#4FC3FC]/20 to-transparent blur-sm" />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── User Profile & Logout ── */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 shadow-inner">
          {user ? (
            <>
              {/* User Profile - Modern Design */}
              <div className="px-4 pt-4 pb-3">
                <Link
                  href="/home"
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md group"
                >
                  {/* Decorative SVG */}
                  <DecorativeSvg />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#4FC3FC] transition-colors">
                      {user.name || "Admin User"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email || "admin@papervault.com"}
                      </p>
                    </div>
                    {/* Role Badge */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#4FC3FC]/10 text-[#4FC3FC] border border-[#4FC3FC]/20">
                        <Sparkles className="w-2.5 h-2.5" />
                        {user.role === "super_admin"
                          ? "Super Admin"
                          : user.role === "admin"
                            ? "Admin"
                            : "User"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="text-[10px] text-gray-400">Active</span>
                    </div>
                  </div>

                  {/* Home Icon */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Home className="w-4 h-4 text-[#4FC3FC]" />
                  </div>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                <Link
                  href="/home"
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            /* ── Login button when not logged in ── */
            <div className="px-4 py-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-[#4FC3FC]/20"
              >
                <LogOut className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
