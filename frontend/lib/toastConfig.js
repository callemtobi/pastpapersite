import toast from "react-hot-toast";

/**
 * Show success toast notification
 * @param {string} message - Success message to display
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 4000,
    position: "top-right",
  });
};

/**
 * Show error toast notification
 * @param {string} message - Error message to display
 */
export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
  });
};

/**
 * Show warning toast notification
 * @param {string} message - Warning message to display
 */
export const showWarningToast = (message) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    icon: "⚠️",
  });
};

/**
 * Show info toast notification
 * @param {string} message - Info message to display
 */
export const showInfoToast = (message) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    icon: "ℹ️",
  });
};

/**
 * Show loading toast notification (for long operations)
 * @param {string} message - Loading message to display
 * @returns {string} - Toast ID for later dismissal
 */
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    position: "top-right",
  });
};

/**
 * Dismiss a specific toast by ID
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
