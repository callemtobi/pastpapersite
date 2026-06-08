"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!regex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError(validateEmail(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setEmailError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/forgot-password",
        { email },
      );

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(
          response.data.message || "Something went wrong. Please try again.",
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      // For security, show generic message even if email doesn't exist
      setSuccess(true); // Don't reveal if email exists
    } finally {
      setIsLoading(false);
    }
  };

  // If success, show confirmation message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        <div className="hidden md:flex w-full max-w-3xl shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800">
          {/* Left panel - same branding */}
          <div className="w-2/5 bg-[#4FC3FC] flex flex-col justify-between p-8 text-white">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/25 mb-5">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">PaperVault</h1>
              <p className="text-sm text-white/80">
                Access past examination papers
              </p>
            </div>
            <div>
              <div className="bg-white/15 rounded-xl p-4 mb-4 text-sm space-y-1.5">
                <p className="font-semibold text-white/70 text-xs uppercase tracking-wide mb-2">
                  What you get
                </p>
                {[
                  "Searchable past papers archive",
                  "Filter by subject & year",
                  "Download & print instantly",
                  "Course-specific collections",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
                    <span className="text-white/90">{f}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/60">
                For authorized university students only
              </p>
            </div>
          </div>

          {/* Right panel - success message */}
          <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {email}
                </span>
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Return to Sign In
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                >
                  Try another email address
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile success view */}
        <div className="md:hidden w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              We&apos;ve sent a password reset link to {email}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main forgot password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      {/* Desktop View */}
      <div
        className="hidden md:flex w-full max-w-3xl shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800"
        style={{ minHeight: "min(88vh, 500px)" }}
      >
        {/* Left panel — branding */}
        <div className="w-2/5 bg-[#4FC3FC] flex flex-col justify-between p-8 text-white">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/25 mb-5">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">PaperVault</h1>
            <p className="text-sm text-white/80">
              Access past examination papers
            </p>
          </div>
          <div>
            <div className="bg-white/15 rounded-xl p-4 mb-4 text-sm space-y-1.5">
              <p className="font-semibold text-white/70 text-xs uppercase tracking-wide mb-2">
                Why reset password?
              </p>
              {[
                "Secure account recovery",
                "Maintain access to your papers",
                "Keep your saved preferences",
                "Continue downloading resources",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
                  <span className="text-white/90">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/60">
              For authorized university students only
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Forgot password?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Sending reset link..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-[#4FC3FC] hover:text-[#29b6f6] font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4FC3FC] mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PaperVault
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access past examination papers
          </p>
        </div>

        <div className="border-0 shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forgot password?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your email to reset your password
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email-mobile"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email-mobile"
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-[#4FC3FC] hover:text-[#29b6f6] font-medium"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          For authorized university students only
        </p>
      </div>
    </div>
  );
}
