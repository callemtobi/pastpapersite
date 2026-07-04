"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  LogOut,
  Eye,
  GraduationCap,
  Mail,
} from "lucide-react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "@/lib/toastConfig";
import { useAuth } from "../context/AuthContext";

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
          icon: User,
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
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#4FC3FC] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            PaperVault
          </span>
          <span className="text-xs bg-[#4FC3FC]/10 text-[#4FC3FC] px-2 py-0.5 rounded-full ml-auto">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {menuItems.map((section) => (
            <div key={section.section}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
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
            </div>
          ))}
        </nav>

        {/* ── User Profile & Logout ── */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {user ? (
            <>
              {/* User Profile */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#4FC3FC] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {user.name?.charAt(0).toUpperCase() || "A"}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email || "admin@papervault.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="px-3 pb-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </>
          ) : (
            /* ── Login button when not logged in ── */
            <div className="px-4 py-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
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
