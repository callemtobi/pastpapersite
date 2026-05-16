"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

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

const RESEND_COOLDOWN = 60; // seconds

// Place this ABOVE the `export default function Register()` line

const OtpPanel = ({
  compact = false,
  otp,
  otpRefs,
  otpError,
  otpSuccess,
  otpLoading,
  resendCooldown,
  pendingEmail,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  handleVerifyOtp,
  handleResend,
  setStep,
  setOtpError,
  setOtpSuccess,
}) => (
  <div className={compact ? "space-y-4" : "space-y-5"}>
    {/* Icon + heading */}
    <div className="flex flex-col items-center text-center gap-2">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#4FC3FC]/15 mb-1">
        <ShieldCheck className="w-7 h-7 text-[#4FC3FC]" />
      </div>
      <h3
        className={`font-bold text-gray-900 dark:text-white ${compact ? "text-xl" : "text-2xl"}`}
      >
        Verify your email
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {pendingEmail}
        </span>
        . Enter it below to activate your account.
      </p>
    </div>

    <form onSubmit={handleVerifyOtp} className="space-y-4">
      {/* 6-digit boxes */}
      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (otpRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className={`w-11 h-12 text-center text-lg font-bold border rounded-lg
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none transition-colors
              ${
                otpError
                  ? "border-red-400 focus:border-red-500"
                  : digit
                    ? "border-[#4FC3FC] focus:border-[#29b6f6]"
                    : "border-gray-300 dark:border-gray-600 focus:border-[#4FC3FC]"
              }`}
          />
        ))}
      </div>

      {/* Feedback */}
      {otpError && (
        <p className="text-center text-sm text-red-500">{otpError}</p>
      )}
      {otpSuccess && (
        <p className="text-center text-sm text-green-500">{otpSuccess}</p>
      )}

      {/* Verify button */}
      <button
        type="submit"
        disabled={otpLoading || otp.join("").length < 6}
        className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
      >
        {otpLoading ? "Verifying…" : "Verify email"}
      </button>
    </form>

    {/* Resend + Back row */}
    <div className="flex items-center justify-between text-sm">
      <button
        type="button"
        onClick={() => {
          setStep("register");
          setOtpError("");
          setOtpSuccess("");
        }}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
      <button
        type="button"
        onClick={handleResend}
        disabled={resendCooldown > 0}
        className="inline-flex items-center gap-1.5 text-[#4FC3FC] hover:text-[#29b6f6] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
      </button>
    </div>
  </div>
);

export default function Register() {
  const router = useRouter();

  // ── Step state ──────────────────────────────────────────────
  const [step, setStep] = useState("register"); // "register" | "verify"
  const [pendingEmail, setPendingEmail] = useState("");

  // ── Registration form ────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  // ── OTP state ────────────────────────────────────────────────
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────
  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Start the resend cooldown timer
  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // ── Step 1 — Registration submit ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        department: formData.department,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setPendingEmail(formData.email);
      setStep("verify");
      startCooldown();
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — OTP digit input ──────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Allow only digits
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    // Auto-advance focus
    if (value && index < 6) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 5);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[6]?.focus();
    }
  };

  // ── Step 2 — OTP verify submit ───────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/verify-otp",
        { email: pendingEmail, otp: otpValue },
      );
      // Backend should return a JWT on successful verification
      const token = response.data?.token;
      console.log(`Token::: ${token}`);

      if (token) {
        localStorage.setItem("token", token);
      }
      setOtpSuccess("Email verified! Redirecting…");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
          "Invalid or expired code. Please try again.",
      );
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Step 2 — Resend OTP ──────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    setOtpSuccess("");
    try {
      await axios.post("http://localhost:8000/api/auth/resend-otp", {
        email: pendingEmail,
      });
      setOtpSuccess("A new code has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      startCooldown();
    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
          "Failed to resend code. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#4FC3FC]/10 via-[#DDE3EA]/30 to-white">
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
              {step === "register"
                ? "Create your account to get started"
                : "One last step — verify your email"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-4">
              {["register", "verify"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step === s
                        ? "bg-white text-[#4FC3FC]"
                        : step === "verify" && s === "register"
                          ? "bg-white/50 text-white"
                          : "bg-white/20 text-white/60"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 1 && <div className="w-6 h-px bg-white/40" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/60">
              Step {step === "register" ? 1 : 2} of 2 —{" "}
              {step === "register" ? "Account details" : "Email verification"}
            </p>
          </div>

          <div>
            {step === "register" && (
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
            )}
            <p className="text-[10px] text-white/60">
              By registering, you agree to our Terms of Service
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8 dark:bg-gray-800 overflow-y-auto">
          {step === "register" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Create account
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Enter your details to register
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Name + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name-d"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Name
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
                      Email
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

                {/* Student ID + Department */}
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
                      onChange={(e) =>
                        updateField("department", e.target.value)
                      }
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

                {/* Password + Confirm */}
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
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
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

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors mt-1"
                >
                  {loading ? "Creating account…" : "Create account"}
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
            </>
          ) : (
            <OtpPanel
              otp={otp}
              otpRefs={otpRefs}
              otpError={otpError}
              otpSuccess={otpSuccess}
              otpLoading={otpLoading}
              resendCooldown={resendCooldown}
              pendingEmail={pendingEmail}
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              handleOtpPaste={handleOtpPaste}
              handleVerifyOtp={handleVerifyOtp}
              handleResend={handleResend}
              setStep={setStep}
              setOtpError={setOtpError}
              setOtpSuccess={setOtpSuccess}
            />
          )}
        </div>
      </div>

      {/* ── Portrait card (mobile) ── */}
      <div className="md:hidden w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4FC3FC] mb-4">
            {step === "register" ? (
              <GraduationCap className="w-8 h-8 text-white" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "register" ? "Join PaperVault" : "Verify Email"}
          </h1>
          <p className="text-gray-600">
            {step === "register"
              ? "Create your account to get started"
              : "Check your inbox for the code"}
          </p>
        </div>

        <div className="border-0 shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 space-y-1">
            {/* Step indicator (mobile) */}
            <div className="flex items-center gap-2 mb-3">
              {["register", "verify"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step === s
                        ? "bg-[#4FC3FC] text-white"
                        : step === "verify" && s === "register"
                          ? "bg-[#4FC3FC]/40 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 1 && <div className="w-4 h-px bg-gray-300" />}
                </div>
              ))}
              <span className="text-xs text-gray-400 ml-1">
                Step {step === "register" ? 1 : 2} of 2
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === "register" ? "Create account" : "Enter your code"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {step === "register"
                ? "Enter your details to register"
                : `Sent to ${pendingEmail}`}
            </p>
          </div>

          <div className="p-6">
            {step === "register" ? (
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
                    value={formData.department}
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

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? "Creating account…" : "Create account"}
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
            ) : (
              <OtpPanel
                compact
                otp={otp}
                otpRefs={otpRefs}
                otpError={otpError}
                otpSuccess={otpSuccess}
                otpLoading={otpLoading}
                resendCooldown={resendCooldown}
                pendingEmail={pendingEmail}
                handleOtpChange={handleOtpChange}
                handleOtpKeyDown={handleOtpKeyDown}
                handleOtpPaste={handleOtpPaste}
                handleVerifyOtp={handleVerifyOtp}
                handleResend={handleResend}
                setStep={setStep}
                setOtpError={setOtpError}
                setOtpSuccess={setOtpSuccess}
              />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          By registering, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
