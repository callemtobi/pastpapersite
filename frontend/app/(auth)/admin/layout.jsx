"use client";

import "@/css/globals.css";
import Sidebar from "@/app/components/Sidebar";
import { useState, useContext } from "react";
// import { SidebarProvider } from "@/app/context/SidebarContext";
// import SidebarLayout from "@/app/components/SidebarLayout";
import {
  Menu,
  FileText,
  Users,
  Download,
  Clock,
  ChevronDown,
  Bell,
  Search,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {/* Header is now in the layout */}
      <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {children.props?.title || "Dashboard"}
            </h1>
          </div>

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
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </button>

            {/* User */}
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
              <div className="w-8 h-8 rounded-full bg-[#4FC3FC] flex items-center justify-center text-white font-medium text-sm">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Admin
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  admin@papervault.com
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {/* ... rest of header */}
        </div>
      </header>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}

// export default function Layout({ children }) {
//   return (
//     <SidebarProvider>
//       <SidebarLayout>{children}</SidebarLayout>
//     </SidebarProvider>
//   );
// }
