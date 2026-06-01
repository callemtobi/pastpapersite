"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 770);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="text-center py-12 my-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mx-auto max-w-4xl">
      {/* Feedback Section */}
      <div className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Your Feedback or Suggestions
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your feedback will be highly valued to make it easier for other
          students to use this website for their requirements.
        </p>
        <div className="relative">
          <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Your message..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

      {/* Logo & Contact Section */}
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100 mb-2">
          LOGO
        </h2>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
          Pasty Paperyyy
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Near Baghe Naran, Jahaz Chowk
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Phase 2, Hayatabad, Peshawar
        </p>

        <div className="mt-6 space-y-2">
          <div className="flex justify-center items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              T:
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              321 213 545
            </span>
          </div>
          <div className="flex justify-center items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              F:
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              534 345 222
            </span>
          </div>
          <div className="flex justify-center items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              E:
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              thisisatest@gmail.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
