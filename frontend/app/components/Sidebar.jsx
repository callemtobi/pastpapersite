"use client";

import { usePathname } from "next/navigation";
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
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

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
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-gray-700">
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
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
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

          {/* Logout */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
