"use client";

import Sidebar from "@/app/components/Sidebar";
// import { useSidebar } from "@/app/context/SidebarContext";
import { Menu } from "lucide-react";

export default function SidebarLayout({ children }) {
  // const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <main className="flex-1 overflow-auto w-full md:w-auto pt-16 md:pt-0">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        {/* <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div> */}
        {children}
      </main>
    </div>
  );
}
