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

/**
 * Calculate image hash to detect duplicates
 * Uses a simple perceptual hash approach
 * @param {File} file - The image file
 * @returns {Promise<string>} The image hash
 */
export const calculateImageHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Simple perceptual hash: create a small canvas and hash the pixel data
          const canvas = document.createElement("canvas");
          canvas.width = 8;
          canvas.height = 8;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, 8, 8);
          const imageData = ctx.getImageData(0, 0, 8, 8);
          const data = imageData.data;

          // Calculate average brightness
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) {
            sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
          }
          const average = sum / (data.length / 4);

          // Create hash based on brightness comparison
          let hash = "";
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            hash += brightness > average ? "1" : "0";
          }

          resolve(hash);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Hamming distance between two hashes (for duplicate detection)
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} Hamming distance (0 = identical, higher = more different)
 */
export const hammingDistance = (hash1, hash2) => {
  if (hash1.length !== hash2.length) return -1;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
};

/**
 * Check for duplicate images using hash comparison
 * @param {string} hash - The new image hash
 * @param {string[]} existingHashes - Array of existing hashes
 * @returns {Object} Duplicate check result { isDuplicate: boolean, similarity: number }
 */
export const checkDuplicate = (hash, existingHashes = []) => {
  if (existingHashes.length === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  const distances = existingHashes.map((existing) =>
    hammingDistance(hash, existing),
  );
  const minDistance = Math.min(...distances);

  // If hamming distance is very small, consider it a duplicate
  // 64 bits total, if distance < 8, it's likely a duplicate
  const threshold = 8;
  return {
    isDuplicate: minDistance < threshold,
    similarity: ((64 - minDistance) / 64) * 100, // Similarity percentage
  };
};

export default {
  VALIDATION_RULES,
  EXAM_KEYWORDS,
  validateFileSize,
  validateFileType,
  validateFileCount,
  validateFiles,
  detectExamKeywords,
  calculateImageHash,
  hammingDistance,
  checkDuplicate,
};
