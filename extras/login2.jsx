"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock } from "lucide-react";
import axios from "axios";

export default function Login() {
  const route = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        { email: formData.email, password: formData.password },
      );
      console.log("user data sent", response.data);
      route.push("/");
    } catch (error) {
      alert("Error: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#4FC3FC]/10 via-[#DDE3EA]/30 to-white">
      <div className="w-full max-w-md">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Sign in
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Dont have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
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
