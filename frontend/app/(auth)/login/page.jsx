"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Mail, Lock, Loader } from "lucide-react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/lib/toastConfig";
import { useAuth } from "@/app/context/AuthContext";

const REDIRECT_MESSAGES = {
  auth_required: "Please log in to access that page.",
  session_expired: "Your session expired. Please log in again.",
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const from = searchParams.get("from");
    if (from === "/upload") {
      showErrorToast("You need to be logged in to access that page.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setError("");
    setEmailError("");
    setPasswordError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setEmailError("");
    setPasswordError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      const role = response.data.user.role;
      showSuccessToast("Logged in successfully.");
      await refetchUser();

      router.push(
        role === "admin" || role === "super_admin" ? "/admin" : "/home",
      );
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Something went wrong.";

      if (status === 401) {
        const attemptsRemaining = error.response?.data?.attemptsRemaining;

        setPasswordError(
          attemptsRemaining >= 0
            ? `Incorrect email or password. ${attemptsRemaining} attempt(s) remaining.`
            : "Incorrect email or password.",
        );
        showErrorToast(`You have ${attemptsRemaining} attempts remaining.`);
      } else if (status === 404) {
        setEmailError("No account found with this email.");
      } else if (status === 429) {
        const retryAfter = error.response?.data?.retryAfter;

        if (retryAfter) {
          const minutes = Math.floor(retryAfter / 60);
          const seconds = retryAfter % 60;

          setError(
            `Too many login attempts. Try again in ${minutes}m ${seconds}s.`,
          );
        } else {
          setError("Too many login attempts. Please try again later.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason && REDIRECT_MESSAGES[reason]) {
      showErrorToast(REDIRECT_MESSAGES[reason], {
        id: reason,
      });

      const url = new URL(window.location.href);
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-background">
      {/* ── Landscape card (desktop) ── */}
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

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email-d"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email-d"
                  type="email"
                  name="email"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password-d"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password-d"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                />
              </div>
              {/* {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )} */}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                {/* <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Remember me
                </span> */}
              </label>
              <a
                href="/forgot-password"
                className="text-[#4FC3FC] hover:text-blue-500"
              >
                Forgot password?
              </a>
            </div>

            <button
              id="submit-d"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {"Don't have an account?"}{" "}
              <Link
                href="/register"
                className="text-[#4FC3FC] hover:text-blue-500 font-medium"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ── Portrait card (mobile) ── */}
      <div className="md:hidden w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4FC3FC] mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PaperVault</h1>
          <p className="text-gray-600">Access past examination papers</p>
        </div>

        <div className="border-0 shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
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
                  htmlFor="email-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email-m"
                    type="email"
                    name="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password-m"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  {/* <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Remember me
                  </span> */}
                </label>
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {"Don't have an account?"}{" "}
                <Link
                  href="/register"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  Register here
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
