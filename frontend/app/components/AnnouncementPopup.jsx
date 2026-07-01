// components/AnnouncementPopup.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

export default function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen announcements this session
    const sessionKey = "announcements_shown";
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/papers/announcements/active",
        );
        if (response.data.success && response.data.announcements.length > 0) {
          setAnnouncements(response.data.announcements);
          setIsVisible(true);
          sessionStorage.setItem(sessionKey, "true");
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };

    // Show popup after a short delay
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Announcement
            </span>
            {announcements.length > 1 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentIndex + 1}/{announcements.length}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {currentAnnouncement.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {currentAnnouncement.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-400">
            {new Date(currentAnnouncement.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1">
            {announcements.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
