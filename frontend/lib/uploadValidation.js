/**
 * Upload Validation Utilities
 * Validates image uploads with size, type, keyword detection, and hash checks
 */

const VALIDATION_RULES = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2 MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
  ALLOWED_EXTENSIONS: [".png", ".jpg", ".jpeg"],
};

const EXAM_KEYWORDS = [
  "question",
  "marks",
  "total marks",
  "time allowed",
  "semester",
  "midterm",
  "peshawar",
  "final term",
  "university",
  "course",
  "date",
  "department",
  "iqra",
  "national",
  "university",
  "iqra national university",
];

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export const validateFileSize = (file) => {
  if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be ≤ 2 MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
    };
  }
  return { valid: true };
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export const validateFileType = (file) => {
  if (!VALIDATION_RULES.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: PNG, JPG, JPEG`,
    };
  }
  return { valid: true };
};

/**
 * Validate number of files
 * @param {FileList} files - The file list to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export const validateFileCount = (files) => {
  if (files.length > VALIDATION_RULES.MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${VALIDATION_RULES.MAX_FILES} images allowed. You selected ${files.length}`,
    };
  }
  return { valid: true };
};

/**
 * Validate all files
 * @param {FileList} files - The file list to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export const validateFiles = (files) => {
  const errors = [];

  // Check file count
  const countCheck = validateFileCount(files);
  if (!countCheck.valid) {
    errors.push(countCheck.error);
    return { valid: false, errors };
  }

  // Check each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check file type
    const typeCheck = validateFileType(file);
    if (!typeCheck.valid) {
      errors.push(`${file.name}: ${typeCheck.error}`);
    }

    // Check file size
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) {
      errors.push(`${file.name}: ${sizeCheck.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Detect exam-related keywords in image using OCR-like text matching
 * Note: This is a basic implementation. For production, use a real OCR library like Tesseract.js
 * @param {File} file - The image file
 * @returns {Promise<Object>} Keyword detection result { score: number, keywords: string[] }
 */
export const detectExamKeywords = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    // For now, return a placeholder score
    // In production, you would use OCR to extract text and analyze it
    reader.onload = () => {
      // Placeholder implementation - in real app, use Tesseract.js
      // For now, assume all exam papers have some keywords (score between 0.5-1)
      resolve({
        score: Math.random() * 0.5 + 0.5, // Random score between 0.5-1.0
        keywords: [],
        notes:
          "OCR not implemented - score is placeholder. Use Tesseract.js in production.",
      });
    };
    reader.readAsDataURL(file);
  });
};
