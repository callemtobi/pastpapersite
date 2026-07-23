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
    // const sessionKey = "announcements_shown";
    // if (sessionStorage.getItem(sessionKey)) {
    //   return;
    // }

    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/papers/announcements/active",
        );
        if (response.data.success && response.data.announcements.length > 0) {
          setAnnouncements(response.data.announcements);
          setIsVisible(true);
          // sessionStorage.setItem(sessionKey, "true");
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
    } else {
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-background rounded-xl shadow-2xl border border-border-light  overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-button-bg border-b border-border-light">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-background-secondary" />
            <span className="text-sm font-medium text-background-secondary">
              Announcement
            </span>
            {announcements.length > 1 && (
              <span className="text-xs text-background">
                {currentIndex + 1}/{announcements.length}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-background transition-colors"
          >
            <X className="w-4 h-4 text-background hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold text-foreground mb-1">
            {currentAnnouncement.title}
          </h4>
          <p className="text-sm text-foreground">
            {currentAnnouncement.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-light">
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
                  disabled={currentIndex >= announcements.length - 1}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
