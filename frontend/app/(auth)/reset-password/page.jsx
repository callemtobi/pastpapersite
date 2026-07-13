"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import axios from "axios";
import {
  validatePassword,
  checkPasswordStrength,
  validatePasswordMatch,
} from "@/lib/passwordValidation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract token from URL query parameter (since your route doesn't use path param)
  const token = searchParams?.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(false);

  // Password strength criteria
  const [passwordStrength, setPasswordStrength] = useState(
    checkPasswordStrength(""),
  );
  // Optional: Verify token with backend
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setCheckingToken(false);
        return;
      }

      setCheckingToken(true);
      try {
        // You can create a verify endpoint or just let the reset attempt fail
        // For now, we'll assume token might be valid and check on submit
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    const errors = [];

    if (!password) {
      errors.push("Password is required");
    } else {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
      }
      if (password.length > 128) {
        errors.push("Password must not exceed 128 characters");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      checkPasswordStrength(value);
      const errors = validatePassword(value);
      if (errors.length > 0) {
        setPasswordError(errors[0]);
      } else {
        setPasswordError("");
      }

      // Check confirm password match
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else if (
        formData.confirmPassword &&
        value === formData.confirmPassword
      ) {
        setConfirmPasswordError("");
      }
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password
    const errors = validatePassword(formData.password);
    const matchError = validatePasswordMatch(
      formData.password,
      formData.confirmPassword,
    );
    if (matchError) errors.push(matchError);

    if (errors.length > 0) {
      setError(errors);
      return;
    }

    // Check if token exists
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Send request matching your controller's expected format
      const response = await axios.post(
        "http://localhost:8000/api/auth/reset-password",
        {
          token: token, // Send token in body (not URL)
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
      );

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(
          response.data.message ||
            "Failed to reset password. Please try again.",
        );
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid or expired reset link. Please request a new one.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#4FC3FC] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // Show error if token is missing
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        <div className="hidden md:flex w-full max-w-3xl shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800">
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
          </div>

          <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No reset token provided. Please request a new password reset
                link.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              No reset token provided
            </p>
            <Link
              href="/forgot-password"
              className="block w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after password reset
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        <div className="hidden md:flex w-full max-w-3xl shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800">
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
          </div>

          <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your password has been reset. You can now sign in with your new
                password.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Sign In Now
              </button>
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
              Password Reset Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Your password has been reset
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      {/* Desktop View */}
      <div
        className="hidden md:flex w-full max-w-3xl shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800"
        style={{ minHeight: "min(88vh, 550px)" }}
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
                Password Requirements
              </p>
              {[
                "At least 8 characters long",
                "One uppercase & one lowercase letter",
                "At least one number",
                "One special character",
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
            Create new password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Choose a strong password for your account
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )}

              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {Object.values(passwordStrength).map((valid, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          valid
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <p
                      className={
                        passwordStrength.hasMinLength
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }
                    >
                      ✓ 8+ characters
                    </p>
                    <p
                      className={
                        passwordStrength.hasUpperCase
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }
                    >
                      ✓ Uppercase letter
                    </p>
                    <p
                      className={
                        passwordStrength.hasLowerCase
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }
                    >
                      ✓ Lowercase letter
                    </p>
                    <p
                      className={
                        passwordStrength.hasNumber
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }
                    >
                      ✓ Number
                    </p>
                    <p
                      className={
                        passwordStrength.hasSpecialChar
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }
                    >
                      ✓ Special character
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] focus:ring-1 focus:ring-[#4FC3FC]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-500">
                  {confirmPasswordError}
                </p>
              )}
              {formData.confirmPassword &&
                !confirmPasswordError &&
                formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !!passwordError || !!confirmPasswordError}
              className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Resetting password..." : "Reset Password"}
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

      {/* Mobile View - same as before but with updated form */}
      <div className="md:hidden w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4FC3FC] mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PaperVault
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create new password
          </p>
        </div>

        <div className="border-0 shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Choose a strong password
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
                  htmlFor="password-mobile"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password-mobile"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword-mobile"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword-mobile"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-red-500">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isLoading || !!passwordError || !!confirmPasswordError
                }
                className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Resetting..." : "Reset Password"}
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
