// components/AnnouncementBanner.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, Megaphone } from "lucide-react";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/papers/announcements/active",
        );
        if (response.data.success) {
          setAnnouncements(response.data.announcements);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading || !isVisible || announcements.length === 0) return null;

  return (
    <div className="bg-background border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {announcements.map((announcement, index) => (
          <div
            key={announcement._id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <Megaphone className="w-5 h-5 text-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {announcement.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {announcement.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
