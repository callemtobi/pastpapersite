// app/admin/manage/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  Loader2,
  Save,
  User,
  Mail,
  Shield,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";

// ── Department Management ──────────────────────────────────────
const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [showInactive, setShowInactive] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/admin/departments",
        );
        if (response.data.success) {
          setDepartments(response.data.departments);
        }
      } catch (err) {
        showErrorToast("Failed to fetch departments");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    const toast = showLoadingToast("Creating department...");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/departments",
        formData,
      );
      dismissToast(toast);
      if (response.data.success) {
        setDepartments([response.data.department, ...departments]);
        showSuccessToast("Department created successfully!");
        setShowCreateModal(false);
        setFormData({ name: "" });
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || "Failed to create department",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    const toast = showLoadingToast("Updating department...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/departments/${selectedDepartment._id}`,
        { name: formData.course },
      );
      dismissToast(toast);
      if (response.data.success) {
        setDepartments(
          departments.map((d) =>
            d._id === selectedDepartment._id ? response.data.department : d,
          ),
        );
        showSuccessToast("Department updated successfully!");
        setShowEditModal(false);
        setSelectedDepartment(null);
        setFormData({ name: "" });
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || "Failed to update department",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (department) => {
    const action = department.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} "${department.name}"?`))
      return;

    const toast = showLoadingToast(`${action}ing department...`);

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/departments/${department._id}`,
        { isActive: !department.isActive },
      );
      dismissToast(toast);
      if (response.data.success) {
        setDepartments(
          departments.map((d) =>
            d._id === department._id ? response.data.department : d,
          ),
        );
        showSuccessToast(`Department ${action}d successfully!`);
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || `Failed to ${action} department`,
      );
    }
  };

  const getFilteredDepartments = () => {
    let filtered = departments;
    if (searchQuery) {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (!showInactive) {
      filtered = filtered.filter((d) => d.isActive);
    }
    return filtered;
  };

  const filteredItems = getFilteredDepartments();
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setFormData({ name: department.name });
    setShowEditModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Departments
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {departments.filter((d) => d.isActive).length} active departments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Show inactive
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((dept) => (
                <tr
                  key={dept._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {dept.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        dept.isActive
                          ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                          : "text-red-500 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      {dept.isActive ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {dept.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(dept)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          dept.isActive
                            ? "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                        title={dept.isActive ? "Deactivate" : "Activate"}
                      >
                        {dept.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-8">
            <Building className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No departments match your search"
                : "No departments found"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Showing {startIndex + 1} to {endIndex} of {totalItems}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-[#4FC3FC] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          title="Add Department"
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ name: "" });
          }}
          onSubmit={handleCreate}
          loading={modalLoading}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              required
            />
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          title="Edit Department"
          onClose={() => {
            setShowEditModal(false);
            setSelectedDepartment(null);
            setFormData({ name: "" });
          }}
          onSubmit={handleUpdate}
          loading={modalLoading}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Instructor Management ──────────────────────────────────────
const InstructorManager = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "Mr.", name: "" });
  const [showInactive, setShowInactive] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const titles = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sir."];

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/admin/instructors",
        );
        if (response.data.success) {
          setInstructors(response.data.instructors);
        }
      } catch (err) {
        showErrorToast("Failed to fetch instructors");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    const toast = showLoadingToast("Creating instructor...");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/instructors",
        formData,
      );
      dismissToast(toast);
      if (response.data.success) {
        setInstructors([response.data.instructor, ...instructors]);
        showSuccessToast("Instructor created successfully!");
        setShowCreateModal(false);
        setFormData({ title: "Mr.", name: "" });
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || "Failed to create instructor",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    const toast = showLoadingToast("Updating instructor...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/instructors/${selectedInstructor._id}`,
        formData,
      );
      dismissToast(toast);
      if (response.data.success) {
        setInstructors(
          instructors.map((i) =>
            i._id === selectedInstructor._id ? response.data.instructor : i,
          ),
        );
        showSuccessToast("Instructor updated successfully!");
        setShowEditModal(false);
        setSelectedInstructor(null);
        setFormData({ title: "Mr.", name: "" });
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || "Failed to update instructor",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (instructor) => {
    const action = instructor.isActive ? "deactivate" : "activate";
    if (
      !confirm(
        `Are you sure you want to ${action} "${instructor.title} ${instructor.name}"?`,
      )
    )
      return;

    const toast = showLoadingToast(`${action}ing instructor...`);

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/instructors/${instructor._id}`,
        { isActive: !instructor.isActive },
      );
      dismissToast(toast);
      if (response.data.success) {
        setInstructors(
          instructors.map((i) =>
            i._id === instructor._id ? response.data.instructor : i,
          ),
        );
        showSuccessToast(`Instructor ${action}d successfully!`);
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || `Failed to ${action} instructor`,
      );
    }
  };

  const getFilteredInstructors = () => {
    let filtered = instructors;
    if (searchQuery) {
      filtered = filtered.filter((i) =>
        `${i.title} ${i.name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }
    if (!showInactive) {
      filtered = filtered.filter((i) => i.isActive);
    }
    return filtered;
  };

  const filteredItems = getFilteredInstructors();
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const openEditModal = (instructor) => {
    setSelectedInstructor(instructor);
    setFormData({ title: instructor.title, name: instructor.name });
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Instructors
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {instructors.filter((i) => i.isActive).length} active instructors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Show inactive
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Instructor
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search instructors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((instructor) => (
                <tr
                  key={instructor._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {instructor.title} {instructor.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        instructor.isActive
                          ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                          : "text-red-500 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      {instructor.isActive ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {instructor.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(instructor.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(instructor)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(instructor)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          instructor.isActive
                            ? "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                        title={instructor.isActive ? "Deactivate" : "Activate"}
                      >
                        {instructor.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No instructors match your search"
                : "No instructors found"}
            </p>
          </div>
        )}

        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Showing {startIndex + 1} to {endIndex} of {totalItems}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-[#4FC3FC] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <Modal
          title="Add Instructor"
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ title: "Mr.", name: "" });
          }}
          onSubmit={handleCreate}
          loading={modalLoading}
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              >
                {titles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., John Doe"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal
          title="Edit Instructor"
          onClose={() => {
            setShowEditModal(false);
            setSelectedInstructor(null);
            setFormData({ title: "Mr.", name: "" });
          }}
          onSubmit={handleUpdate}
          loading={modalLoading}
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
              >
                {titles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., John Doe"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Course Management ──────────────────────────────────────────
const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", department: "" });
  const [showInactive, setShowInactive] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/admin/courses",
        );
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (err) {
        showErrorToast("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/admin/departments",
        );
        if (response.data.success) {
          setDepartments(response.data.departments);
        }
      } catch (err) {
        showErrorToast("Failed to fetch departments");
      }
    };
    fetchDepartments();
  }, []);

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d._id === deptId);
    return dept ? dept.name : "Unknown";
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    const toast = showLoadingToast("Creating course...");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/courses",
        formData,
      );
      dismissToast(toast);
      if (response.data.success) {
        setCourses([response.data.course, ...courses]);
        showSuccessToast("Course created successfully!");
        setShowCreateModal(false);
        setFormData({ name: "", department: "" });
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(err.response?.data?.message || "Failed to create course");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    const toast = showLoadingToast("Updating course...");

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/courses/${selectedCourse._id}`,
        formData,
      );
      dismissToast(toast);
      if (response.data.success) {
        setCourses(
          courses.map((c) =>
            c._id === selectedCourse._id ? response.data.course : c,
          ),
        );
        showSuccessToast("Course updated successfully!");
        setShowEditModal(false);
        setSelectedCourse(null);
        setFormData({ name: "", department: "" });
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(err.response?.data?.message || "Failed to update course");
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (course) => {
    const action = course.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} "${course.name}"?`))
      return;

    const toast = showLoadingToast(`${action}ing course...`);

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/courses/${course._id}`,
        { isActive: !course.isActive },
      );
      dismissToast(toast);
      if (response.data.success) {
        setCourses(
          courses.map((c) => (c._id === course._id ? response.data.course : c)),
        );
        showSuccessToast(`Course ${action}d successfully!`);
      }
    } catch (err) {
      dismissToast(toast);
      showErrorToast(
        err.response?.data?.message || `Failed to ${action} course`,
      );
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses;
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (!showInactive) {
      filtered = filtered.filter((c) => c.isActive);
    }
    return filtered;
  };

  const filteredItems = getFilteredCourses();
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      department: course.department?._id || course.department,
    });
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Courses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {courses.filter((c) => c.isActive).length} active courses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Show inactive
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3FC] hover:bg-[#29b6f6] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC] text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((course) => (
                <tr
                  key={course._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getDepartmentName(course._id)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        course.isActive
                          ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                          : "text-red-500 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      {course.isActive ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(course)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          course.isActive
                            ? "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                        title={course.isActive ? "Deactivate" : "Activate"}
                      >
                        {course.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No courses match your search"
                : "No courses found"}
            </p>
          </div>
        )}

        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Showing {startIndex + 1} to {endIndex} of {totalItems}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-[#4FC3FC] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <Modal
          title="Add Course"
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ name: "", department: "" });
          }}
          onSubmit={handleCreate}
          loading={modalLoading}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Data Structures"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                required
              >
                <option value="">Select department</option>
                {departments
                  .filter((d) => d.isActive)
                  .map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal
          title="Edit Course"
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
            setFormData({ name: "", department: "" });
          }}
          onSubmit={handleUpdate}
          loading={modalLoading}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Data Structures"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#4FC3FC]"
                required
              >
                <option value="">Select department</option>
                {departments
                  .filter((d) => d.isActive)
                  .map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Reusable Modal Component ──────────────────────────────────
const Modal = ({ title, onClose, onSubmit, loading, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
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
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4FC3FC] hover:bg-[#29b6f6] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────
export default function ManagePage() {
  const [activeTab, setActiveTab] = useState("departments");

  const tabs = [
    { id: "departments", label: "Departments", icon: Building },
    { id: "instructors", label: "Instructors", icon: User },
    { id: "courses", label: "Courses", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 h-16 flex items-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Academic Data
            </h1>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#4FC3FC] text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            {activeTab === "departments" && <DepartmentManager />}
            {activeTab === "instructors" && <InstructorManager />}
            {activeTab === "courses" && <CourseManager />}
          </div>
        </main>
      </div>
    </div>
  );
}
