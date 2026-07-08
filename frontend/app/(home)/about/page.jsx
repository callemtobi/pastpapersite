// app/(home)/about/page.jsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Search,
  Download,
  Upload,
  Mail,
  MessageSquare,
  CircleUserRound,
  ArrowRight,
  Sparkles,
  Send,
  User,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toastConfig";
import axios from "axios";
// import image from public folder
import Image from "next/image";
import INU from "@/public/INU.png";

// ── SVG Image ────────────────────────────────────────────────────
const AboutIllustration = () => (
  <svg
    viewBox="0 0 400 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
  >
    {/* Background shapes */}
    <circle cx="200" cy="175" r="160" fill="#4FC3FC" opacity="0.05" />
    <circle cx="200" cy="175" r="120" fill="#4FC3FC" opacity="0.08" />

    {/* Main book/document shape */}
    <rect
      x="120"
      y="80"
      width="160"
      height="180"
      rx="12"
      fill="#4FC3FC"
      opacity="0.12"
    />
    <rect
      x="135"
      y="95"
      width="130"
      height="150"
      rx="6"
      fill="white"
      stroke="#4FC3FC"
      strokeWidth="2"
    />

    {/* Document lines - representing papers */}
    <rect
      x="155"
      y="115"
      width="70"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.3"
    />
    <rect
      x="155"
      y="130"
      width="90"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.25"
    />
    <rect
      x="155"
      y="145"
      width="80"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.2"
    />
    <rect
      x="155"
      y="160"
      width="60"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.15"
    />
    <rect
      x="155"
      y="175"
      width="75"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.2"
    />
    <rect
      x="155"
      y="190"
      width="50"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.15"
    />
    <rect
      x="155"
      y="205"
      width="65"
      height="6"
      rx="3"
      fill="#4FC3FC"
      opacity="0.2"
    />

    {/* Small decorative elements */}
    <circle cx="80" cy="140" r="25" fill="#4FC3FC" opacity="0.08" />
    <circle cx="320" cy="200" r="30" fill="#4FC3FC" opacity="0.06" />

    {/* Floating paper icons */}
    <rect
      x="60"
      y="220"
      width="28"
      height="38"
      rx="3"
      fill="#4FC3FC"
      opacity="0.1"
      transform="rotate(-15 74 239)"
    />
    <rect
      x="310"
      y="160"
      width="24"
      height="32"
      rx="3"
      fill="#4FC3FC"
      opacity="0.08"
      transform="rotate(10 322 176)"
    />

    {/* Sparkle/star elements */}
    <path
      d="M70 110 L73 118 L81 121 L73 124 L70 132 L67 124 L59 121 L67 118 Z"
      fill="#4FC3FC"
      opacity="0.25"
    />
    <path
      d="M330 100 L333 106 L339 109 L333 112 L330 118 L327 112 L321 109 L327 106 Z"
      fill="#4FC3FC"
      opacity="0.2"
    />
    <path
      d="M240 60 L242 65 L247 67 L242 69 L240 74 L238 69 L233 67 L238 65 Z"
      fill="#4FC3FC"
      opacity="0.2"
    />

    {/* Small dots */}
    <circle cx="100" cy="80" r="4" fill="#4FC3FC" opacity="0.15" />
    <circle cx="300" cy="130" r="3" fill="#4FC3FC" opacity="0.12" />
    <circle cx="70" cy="180" r="3" fill="#4FC3FC" opacity="0.1" />
  </svg>
);

// ── Developer SVG ────────────────────────────────────────────────
const DeveloperAvatar = () => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto max-w-[200px]"
  >
    <circle
      cx="100"
      cy="100"
      r="95"
      fill="#4FC3FC"
      opacity="0.1"
      stroke="#4FC3FC"
      strokeWidth="2"
    />
    <circle cx="100" cy="100" r="75" fill="#4FC3FC" opacity="0.05" />

    {/* Head */}
    <circle cx="100" cy="80" r="35" fill="#4FC3FC" opacity="0.15" />

    {/* Body */}
    <rect
      x="75"
      y="115"
      width="50"
      height="40"
      rx="10"
      fill="#4FC3FC"
      opacity="0.12"
    />

    {/* Face features */}
    <circle cx="88" cy="75" r="4" fill="#4FC3FC" opacity="0.4" />
    <circle cx="112" cy="75" r="4" fill="#4FC3FC" opacity="0.4" />
    <path
      d="M90 90 Q100 100 110 90"
      stroke="#4FC3FC"
      strokeWidth="2"
      fill="none"
      opacity="0.3"
    />

    {/* Code brackets */}
    <text
      x="50"
      y="170"
      fontSize="24"
      fill="#4FC3FC"
      opacity="0.2"
      fontWeight="bold"
    >
      &lt;/&gt;
    </text>
    <text
      x="130"
      y="170"
      fontSize="24"
      fill="#4FC3FC"
      opacity="0.2"
      fontWeight="bold"
    >
      &lt;/&gt;
    </text>
  </svg>
);

export default function AboutPage() {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !email.trim()) {
      showErrorToast("Please fill in both fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Replace with your actual API endpoint
      const response = await axios.post(
        "http://localhost:8000/api/feedback",
        { email, message: feedback },
        { withCredentials: true },
      );

      if (response.data.success) {
        showSuccessToast("Thank you for your feedback!");
        setFeedback("");
        setEmail("");
      } else {
        showErrorToast("Failed to send feedback. Please try again.");
      }
    } catch (error) {
      showErrorToast("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-8">
      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3 pt-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight"
        >
          About <span className="text-[#4FC3FC]">PaperVault</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Empowering students with easy access to past examination papers
        </motion.p>
      </motion.div>

      {/* ── Story Section (Image + Text) ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
      >
        {/* Image */}
        <div className="relative order-2 md:order-1">
          <div className="relative">
            {/* <AboutIllustration /> */}
            <Image src={INU} alt="INU" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text */}
        <div className="order-1 md:order-2 space-y-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl sm:text-3xl font-semibold text-foreground"
          >
            Our Story
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            <p>
              <span className="font-semibold text-foreground">PaperVault</span>{" "}
              started as a small initiative to help students access past
              examination papers easily. It soon became obvious that we needed
              to help students see beyond just papers, and be there with them
              from the start of their academic journey.
            </p>
            <p>
              Currently, we offer a comprehensive archive of past papers, study
              resources, and exam preparation tools. We value our students above
              everything else, meaning that we won&apos;t take &apos;OK&apos; as
              an answer.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Values / What We Offer ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Search,
            title: "Search & Browse",
            desc: "Find papers by course, department, or instructor",
          },
          {
            icon: Download,
            title: "Free Downloads",
            desc: "Access and download papers instantly",
          },
          {
            icon: Upload,
            title: "Upload & Share",
            desc: "Contribute to the community",
          },
          {
            icon: Sparkles,
            title: "Study Tips",
            desc: "Expert strategies for exam success",
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-[#4FC3FC]/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-[#4FC3FC]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Feedback / Suggestion Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#4FC3FC]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#4FC3FC]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Share Your Feedback
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Help us improve PaperVault for everyone by providing suggestions
              for improvement or if there are any issues you encounter while
              using it.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your suggestions, feedback, or ideas..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] resize-none transition-colors"
              required
            />
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Feedback
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* ── Developer Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Avatar */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0">
            <DeveloperAvatar />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-semibold text-foreground flex items-center justify-center sm:justify-start gap-2">
              <User className="w-5 h-5 text-[#4FC3FC]" />
              About the Developer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              Built by{" "}
              <span className="font-medium text-foreground">
                a BS Software Engineering{" "}
              </span>
              graduate, at Iqra National University. My main aim of building
              this project was to help students get their hands on previous past
              papers to get a hint of the pattern of the paper. In addition to
              that, I wanted to test myself of building actual websites that
              tackle a problem domain.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-xs bg-[#4FC3FC]/10 text-[#4FC3FC] px-3 py-1 rounded-full">
                💻 Full-Stack Developer
              </span>
              <span className="text-xs bg-[#4FC3FC]/10 text-[#4FC3FC] px-3 py-1 rounded-full">
                🎓 Student
              </span>
              <span className="text-xs bg-[#4FC3FC]/10 text-[#4FC3FC] px-3 py-1 rounded-full">
                🚀 Next.js
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <Link
                href="#"
                className="p-2 rounded-lg text-gray-400 hover:text-[#4FC3FC] hover:bg-[#4FC3FC]/10 transition-colors"
                aria-label="GitHub"
              >
                <CircleUserRound className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-lg text-gray-400 hover:text-[#4FC3FC] hover:bg-[#4FC3FC]/10 transition-colors"
                aria-label="Twitter"
              >
                <CircleUserRound className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-lg text-gray-400 hover:text-[#4FC3FC] hover:bg-[#4FC3FC]/10 transition-colors"
                aria-label="LinkedIn"
              >
                <CircleUserRound className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:developer@email.com"
                className="p-2 rounded-lg text-gray-400 hover:text-[#4FC3FC] hover:bg-[#4FC3FC]/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Call to Action ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-linear-to-br from-[#4FC3FC] to-[#29b6f6] rounded-2xl p-8 text-white text-center"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to Succeed?
          </h2>
          <p className="text-white/90 mb-6 max-w-md mx-auto">
            Start browsing past papers and join thousands of students who are
            already using PaperVault.
          </p>
          <Link href="/download">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-white text-[#4FC3FC] px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Browse Papers Now
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
