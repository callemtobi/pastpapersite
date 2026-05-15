"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User } from "lucide-react";

const departments = [
  { value: "cs", label: "Computer Science" },
  { value: "eng", label: "Engineering" },
  { value: "math", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chem", label: "Chemistry" },
  { value: "bio", label: "Biology" },
  { value: "econ", label: "Economics" },
  { value: "bus", label: "Business" },
];

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#4FC3FC]/10 via-[#DDE3EA]/30 to-white">
      {/* ── Landscape card (desktop) ── */}
      <div
        className="hidden md:flex w-full max-w-4xl shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800"
        style={{ minHeight: "min(90vh, 580px)" }}
      >
        {/* Left panel — branding */}
        <div className="w-[38%] bg-[#4FC3FC] flex flex-col justify-between p-8 text-white">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/25 mb-5">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Join PaperVault</h1>
            <p className="text-sm text-white/80">
              Create your account to get started
            </p>
          </div>
          <div>
            <div className="bg-white/15 rounded-xl p-4 text-sm space-y-2 mb-4">
              <p className="font-semibold text-white/70 text-xs uppercase tracking-wide mb-2">
                Departments
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {departments.map((d) => (
                  <div
                    key={d.value}
                    className={`text-xs py-1 px-2 rounded-md transition-colors ${
                      formData.department === d.value
                        ? "bg-white/30 text-white font-medium"
                        : "text-white/80"
                    }`}
                  >
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-white/60">
              By registering, you agree to our Terms of Service
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Create account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Enter your details to register
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name + Email side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="name-d"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name-d"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="email-d"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email-d"
                    type="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                </div>
              </div>
            </div>

            {/* Student ID + Department side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="studentId-d"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Student ID
                </label>
                <input
                  id="studentId-d"
                  type="text"
                  placeholder="STU123456"
                  value={formData.studentId}
                  onChange={(e) => updateField("studentId", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="dept-d"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Department
                </label>
                <select
                  id="dept-d"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password + Confirm Password side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="pass-d"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="pass-d"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-d"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirm-d"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors mt-1"
            >
              Create account
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#4FC3FC] hover:text-blue-500 font-medium"
              >
                Sign in
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join PaperVault
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="border-0 shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your details to register
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name-m"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email-m"
                    type="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="studentId-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Student ID
                </label>
                <input
                  id="studentId-m"
                  type="text"
                  placeholder="STU123456"
                  value={formData.studentId}
                  onChange={(e) => updateField("studentId", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="dept-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Department
                </label>
                <select
                  id="dept-m"
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select your department</option>
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="pass-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="pass-m"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-m"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirm-m"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Create account
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          By registering, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
