"use client";

import { useState } from "react";
import { Mail, Send, GraduationCap } from "lucide-react";

export default function Footer() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      setSubmitted(true);
      setFeedback("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Us Section - Inspired by the image */}
        <div className="py-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ABOUT US
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {`PaperVault started as a small initiative to help students access
            past examination papers easily. It soon became obvious that we
            needed to help students see beyond just papers, and be there with
            them from the start of their academic journey. Currently, we offer a
            comprehensive archive of past papers, study resources, and exam
            preparation tools. We value our students above everything else,
            meaning that we won't take "OK" as an answer.`}
          </p>
        </div>

        {/* Simplified Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PaperVault
              </span>
            </div>

            {/* Contact Us */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Contact Us
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                support@papervault.edu
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                +92 91 111 1234
              </p>
            </div>

            {/* Send Feedback */}
            <div className="w-full max-w-sm">
              <form onSubmit={handleFeedbackSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {submitted && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                  Thank you for your feedback!
                </p>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; 2024-2026 PaperVault. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
