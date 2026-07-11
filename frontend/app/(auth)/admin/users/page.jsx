"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  UserPlus,
  Shield,
  Mail,
  User,
  Building,
  Key,
  X,
  Loader2,
  Save,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";
import ConfirmModal from "@/components/ConfirmModal";

// ── View User Modal ──────────────────────────────────────────────
const ViewUserModal = ({ isOpen, onClose, user, onEdit, onDelete }) => {
  if (!isOpen || !user) return null;

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: {
        label: "Admin",
        icon: Shield,
        color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
      },
      user: {
        label: "User",
        icon: User,
        color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      },
      super_admin: {
        label: "Super Admin",
        icon: Shield,
        color: "text-red-500 bg-red-50 dark:bg-red-900/20",
      },
    };
    return roleMap[role] || roleMap.user;
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return {
        label: "Active",
        icon: CheckCircle,
        color: "text-green-500 bg-green-50 dark:bg-green-900/20",
      };
    }
    return {
      label: "Inactive",
      icon: XCircle,
      color: "text-red-500 bg-red-50 dark:bg-red-900/20",
    };
  };

  const roleBadge = getRoleBadge(user.role);
  const statusBadge = getStatusBadge(user.isActive);
  const RoleIcon = roleBadge.icon;
  const StatusIcon = statusBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View user information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#4FC3FC]/20 flex items-center justify-center text-3xl font-bold text-[#4FC3FC]">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Name
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Email
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.email}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Student ID
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.studentId}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Department
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.department?.name}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Role
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
              >
                <RoleIcon className="w-3 h-3" />
                {roleBadge.label}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Status
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusBadge.label}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Verified
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.isVerified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Joined
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit User
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(user._id);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminFormModal = ({ user, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      isActive: true,
    });
    setErrors({});
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      isActive: formData.isActive,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Admin Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a new admin to the system
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "active",
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Create/Edit User Modal ──────────────────────────────────────
const UserFormModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading,
  isEdit = false,
}) => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    password: "",
    confirmPassword: "",
    role: "user",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/papers/departments",
        );

        if (response.data.success) {
          setDepartments(response.data.departments || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast("Failed to load form data. Please refresh.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const setFormDataFunc = async () => {
      if (user && isEdit) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          studentId: user.studentId || "",
          department: user.department || "",
          password: "",
          confirmPassword: "",
          role: user.role || "user",
          isActive: user.isActive !== undefined ? user.isActive : true,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          studentId: "",
          department: "",
          password: "",
          confirmPassword: "",
          role: "user",
          isActive: true,
        });
      }
      setErrors({});
    };
    setFormDataFunc();
  }, [user, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.studentId) newErrors.studentId = "Student ID is required";
    if (!formData.department) newErrors.department = "Department is required";

    if (!isEdit) {
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      studentId: parseInt(formData.studentId),
      department: formData.department,
      role: formData.role,
      isActive: formData.isActive,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4FC3FC]/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#4FC3FC]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEdit ? "Edit User" : "Create User"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEdit
                    ? "Update user information"
                    : "Add a new user to the system"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                  errors.studentId
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                  errors.department
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select department</option>
                {departments?.map((dept) => (
                  <option
                    key={dept._id || dept.name}
                    value={dept._id || dept.name}
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-500">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "active",
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEdit ? "New Password (optional)" : "Password *"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  isEdit ? "Leave blank to keep current" : "••••••••"
                }
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEdit ? "Confirm New Password" : "Confirm Password *"}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Users Page ──────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [error, setError] = useState(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Yes, Delete",
    onConfirm: null,
    isLoading: false,
  });

  // ── Fetch current user role ──────────────────────────────────────
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });
        if (response.data.success) {
          setIsSuperAdmin(response.data.user?.role === "super_admin");
        }
      } catch (error) {
        console.error("Failed to check user role:", error);
      }
    };
    checkUserRole();
  }, []);

  // Fetch users
  useEffect(() => {
    let cancelled = false;
    const getUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/admin/users",
          { withCredentials: true },
        );
        if (!cancelled) {
          if (response.data.success && response.data.users) {
            setUsers(response.data.users);
            console.log(users);
          } else {
            setUsers([]);
          }
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error fetching users data";
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    getUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Create Admin Handler
  const handleCreateAdmin = async (data) => {
    setModalLoading(true);
    const loadingToast = showLoadingToast("Creating admin...");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/admins",
        data,
        { withCredentials: true },
      );
      dismissToast(loadingToast);

      if (response.data.success) {
        setUsers([response.data.admin, ...users]);
        showSuccessToast("Admin created successfully!");
        setShowCreateAdminModal(false);
      } else {
        showErrorToast(response.data.message || "Failed to create admin");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to create admin");
    } finally {
      setModalLoading(false);
    }
  };

  // ── Change User Role Handler (Super Admin only) ─────────────────
  const handleChangeRole = async (userId, newRole) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    const loadingToast = showLoadingToast("Changing role...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/admins/${userId}/role`,
        { role: newRole },
        { withCredentials: true },
      );
      dismissToast(loadingToast);

      if (response.data.success) {
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
        showSuccessToast(`Role updated to ${newRole}`);
      } else {
        showErrorToast(response.data.message || "Failed to change role");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to change role");
    }
  };

  // Filter users
  const getFilteredUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.studentId?.toString().includes(searchQuery),
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((user) =>
        filterStatus === "active" ? user.isActive : !user.isActive,
      );
    }

    if (activeTab === "active") {
      filtered = filtered.filter((user) => user.isActive);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((user) => !user.isActive);
    } else if (activeTab === "admins") {
      filtered = filtered.filter((user) => user.role === "admin");
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getTabCount = (tab) => {
    if (tab === "all") return users.length;
    if (tab === "active") return users.filter((u) => u.isActive).length;
    if (tab === "inactive") return users.filter((u) => !u.isActive).length;
    if (tab === "admins") return users.filter((u) => u.role === "admin").length;
    return 0;
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setSelectedUsers([]);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((u) => u._id));
    }
  };

  const handleSelect = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  // ── CRUD Functions ─────────────────────────────────────────────

  const handleCreateUser = async (data) => {
    setModalLoading(true);
    const loadingToast = showLoadingToast("Creating user...");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/users",
        data,
        { withCredentials: true },
      );
      dismissToast(loadingToast);

      if (response.data.success) {
        setUsers([response.data.user, ...users]);
        showSuccessToast("User created successfully!");
        setShowCreateModal(false);
      } else {
        showErrorToast(response.data.message || "Failed to create user");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to create user");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateUser = async (data) => {
    setModalLoading(true);
    const loadingToast = showLoadingToast("Updating user...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/users/${selectedUser._id}`,
        data,
        { withCredentials: true },
      );
      dismissToast(loadingToast);

      if (response.data.success) {
        setUsers(
          users.map((u) =>
            u._id === selectedUser._id ? response.data.user : u,
          ),
        );
        showSuccessToast("User updated successfully!");
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        showErrorToast(response.data.message || "Failed to update user");
      }
    } catch (err) {
      dismissToast(loadingToast);
      showErrorToast(err.response?.data?.message || "Failed to update user");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete User?",
      message: `Are you sure you want to delete "${user.name}"?`,
      confirmText: "Yes, Delete",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        const loadingToast = showLoadingToast("Deleting user...");
        try {
          const response = await axios.delete(
            `http://localhost:8000/api/admin/users/${userId}`,
            { withCredentials: true },
          );
          dismissToast(loadingToast);
          if (response.data.success) {
            setUsers(users.filter((u) => u._id !== userId));
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
            showSuccessToast("User deleted successfully!");
          } else {
            showErrorToast(response.data.message || "Failed to delete user");
          }
        } catch (err) {
          dismissToast(loadingToast);
          showErrorToast(
            err.response?.data?.message || "Failed to delete user",
          );
        } finally {
          setConfirmModal((prev) => ({
            ...prev,
            isOpen: false,
            isLoading: false,
          }));
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    const userNames = selectedUsers
      .map((id) => {
        const u = users.find((user) => user._id === id);
        return u?.name || "Unknown";
      })
      .join(", ");
    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedUsers.length} User(s)?`,
      message: `Are you sure you want to delete ${selectedUsers.length} selected user(s)?\n\n${userNames}`,
      confirmText: `Yes, Delete ${selectedUsers.length}`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        const loadingToast = showLoadingToast("Deleting users...");
        try {
          const response = await axios.delete(
            "http://localhost:8000/api/admin/users/bulk",
            { data: { ids: selectedUsers }, withCredentials: true },
          );
          dismissToast(loadingToast);
          if (response.data.success) {
            setUsers(users.filter((u) => !selectedUsers.includes(u._id)));
            setSelectedUsers([]);
            showSuccessToast(
              `${response.data.deletedCount} user(s) deleted successfully!`,
            );
          } else {
            showErrorToast(response.data.message || "Failed to delete users");
          }
        } catch (err) {
          dismissToast(loadingToast);
          showErrorToast(
            err.response?.data?.message || "Failed to delete users",
          );
        } finally {
          setConfirmModal((prev) => ({
            ...prev,
            isOpen: false,
            isLoading: false,
          }));
        }
      },
    });
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: {
        label: "Admin",
        icon: Shield,
        color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
      },
      user: {
        label: "User",
        icon: User,
        color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      },
      super_admin: {
        label: "Super Admin",
        icon: Shield,
        color: "text-red-500 bg-red-50 dark:bg-red-900/20",
      },
    };
    return roleMap[role] || roleMap.user;
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return {
        label: "Active",
        icon: CheckCircle,
        color: "text-green-500 bg-green-50 dark:bg-green-900/20",
      };
    }
    return {
      label: "Inactive",
      icon: XCircle,
      color: "text-red-500 bg-red-50 dark:bg-red-900/20",
    };
  };

  const tabs = [
    { id: "all", label: "All", count: getTabCount("all") },
    { id: "active", label: "Active", count: getTabCount("active") },
    { id: "inactive", label: "Inactive", count: getTabCount("inactive") },
    { id: "admins", label: "Admins", count: getTabCount("admins") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Manage Users
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-transparent text-sm text-gray-900 dark:text-white outline-none w-32 lg:w-48"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Create Admin
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Inactive
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {users.filter((u) => !u.isActive).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Admins</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>

          {/* Tabs Menu */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#4FC3FC] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 py-2">
                <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 transition-colors ${
                      viewMode === "table"
                        ? "bg-[#4FC3FC] text-white"
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    title="Table view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#4FC3FC] text-white"
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedUsers.length} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  onClick={() => {
                    setFilterRole("all");
                    setFilterStatus("all");
                    setSearchQuery("");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  Clear All
                </button>

                <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
                  {filteredUsers.length} results
                </span>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-4 py-3 text-left w-10 align-middle">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === currentUsers.length &&
                          currentUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    {/* Mobile-only Status column header */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sm:hidden">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentUsers.map((user, index) => {
                    const roleBadge = getRoleBadge(user.role);
                    const statusBadge = getStatusBadge(user.isActive);
                    const RoleIcon = roleBadge.icon;
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr
                        key={user._id || `user-${index}`}
                        onClick={(e) => {
                          if (
                            e.target.closest(
                              'button, input, a, [role="button"]',
                            )
                          )
                            return;
                          openViewModal(user);
                        }}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          selectedUsers.includes(user._id)
                            ? "bg-[#4FC3FC]/5 dark:bg-[#4FC3FC]/10"
                            : ""
                        }`}
                      >
                        {/* Checkbox - vertically centered */}
                        <td className="px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelect(user._id)}
                            className="rounded border-gray-300 dark:border-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>

                        {/* User Column - always visible, contains extra mobile info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4FC3FC]/20 flex items-center justify-center text-xs font-medium text-[#4FC3FC] shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                              {/* Mobile-only Role badge (kept as is) */}
                              <div className="sm:hidden mt-1">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
                                >
                                  <RoleIcon className="w-3 h-3" />
                                  {roleBadge.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Student ID - hidden on mobile */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user.studentId}
                          </span>
                        </td>

                        {/* Department - hidden on tablet and below */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user.department?.name || "N/A"}
                          </span>
                        </td>

                        {/* Role - hidden on tablet and below */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleBadge.label}
                          </span>
                        </td>

                        {/* Status - hidden on mobile (desktop/tablet) */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Mobile-only Status column */}
                        <td className="px-4 py-3 sm:hidden">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Actions - hidden on mobile */}
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          {user.role !== "super_admin" && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openViewModal(user)}
                                className="p-1.5 text-gray-400 hover:text-[#4FC3FC] rounded-lg hover:bg-[#4FC3FC]/10 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No users found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || showFilters
                    ? "Try adjusting your search or filters"
                    : activeTab !== "all"
                      ? `No ${activeTab} users available`
                      : "Start by adding your first user"}
                </p>
                {!searchQuery && !showFilters && activeTab === "all" && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{endIndex}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> results
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#4FC3FC] text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onEdit={openEditModal}
        onDelete={handleDeleteUser}
      />

      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateUser}
        isLoading={modalLoading}
        isEdit={false}
      />

      <UserFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleUpdateUser}
        isLoading={modalLoading}
        isEdit={true}
      />

      <AdminFormModal
        isOpen={showCreateAdminModal}
        onClose={() => setShowCreateAdminModal(false)}
        onSave={handleCreateAdmin}
        isLoading={modalLoading}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        isLoading={confirmModal.isLoading}
        variant={confirmModal.variant || "danger"}
      />
    </div>
  );
}
