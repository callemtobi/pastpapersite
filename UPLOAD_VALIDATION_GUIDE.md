# Image Upload Validation - Implementation Guide

## Overview

Comprehensive image upload validation has been implemented for both frontend and backend with the following features:

### Validation Rules

- **File Size**: ≤ 1 MB per image
- **Quantity**: Maximum 10 images at once
- **File Types**: PNG, JPG, JPEG only
- **Keyword Detection**: Scores based on exam-related keywords (Question, Q1, Q.1, Marks, Total Marks, Time Allowed, Semester, Midterm, Final Term, University)
- **Image Hash**: Using `image-hash` npm package to detect duplicate images

## Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install image-hash
```

This installs the image hash library for perceptual hashing to detect duplicate images.

### 2. Verify Frontend Dependencies

The frontend uses built-in APIs (FileReader, Canvas) so no additional packages needed for validation.

## File Structure

### Frontend

```
frontend/
├── lib/
│   └── uploadValidation.js          # Validation utilities
└── app/(home)/upload/
    └── page.jsx                      # Updated upload page (multiple files)
```

### Backend

```
backend/
├── controllers/
│   └── paperController.js            # Upload logic & validation
├── routes/
│   └── papers.js                     # Paper endpoints
├── models/
│   └── Paper.js                      # Updated Paper schema
├── uploads/                          # Directory for uploaded images
└── server.js                         # Updated to include papers route
```

## Frontend Validation Functions

### `validateFiles(files)`

Validates all files at once, checking:

- File count (max 10)
- File type (PNG, JPG, JPEG)
- File size (≤ 1 MB)

**Returns**: `{ valid: boolean, errors: string[] }`

### `calculateImageHash(file)`

Creates a perceptual hash of the image to detect similar/duplicate images.

**Returns**: `Promise<string>` - 64-bit hash

### `checkDuplicate(hash, existingHashes)`

Compares image hash with existing hashes using Hamming distance.

**Returns**: `{ isDuplicate: boolean, similarity: number }`

### `detectExamKeywords(file)`

Detects exam-related keywords (OCR simulation, for production use Tesseract.js).

**Returns**: `Promise<{ score: number, keywords: string[] }>`

## Backend Validation

### File Upload Endpoint

**POST** `/api/papers/upload`

Form Data:

- `title` (string) - Paper title
- `courseCode` (string) - Course code
- `subject` (string) - Subject
- `year` (string) - Year
- `semester` (string) - Semester
- `examType` (string) - Exam type
- `description` (string, optional) - Description
- `images` (file[], multiple) - Image files

**Response**:

```json
{
  "success": true,
  "message": "Successfully uploaded X image(s)",
  "paper": {
    "id": "...",
    "title": "...",
    "courseCode": "...",
    "imagesCount": 10,
    "duplicateWarnings": [] // if any
  }
}
```

### Other Endpoints

**GET** `/api/papers` - Get all papers with pagination

- Query params: `page`, `limit`, `subject`, `examType`, `year`

**GET** `/api/papers/:id` - Get specific paper

**DELETE** `/api/papers/:id` - Delete paper and its images

## Validation Flow

### Frontend

1. User selects images
2. Check file count (≤ 10)
3. For each file:
   - Validate file type
   - Validate file size
   - Calculate perceptual hash
   - Check against previously selected hashes for duplicates
   - Detect keywords
4. Display validation errors or proceed
5. On submit, send FormData with images and metadata

### Backend

1. Multer validates files during upload
2. Server-side validation runs:
   - File count check
   - File type validation
   - File size check
3. For each file:
   - Calculate image hash using `image-hash`
   - Compare against all existing paper hashes in DB
   - Detect keywords from filename
4. Create Paper document with all metadata
5. Return response with warnings if duplicates found

## Duplicate Detection

### How it Works

1. **Perceptual Hash**: Creates a compact 64-bit representation of image content
2. **Hamming Distance**: Counts differing bits between hashes
3. **Threshold**: If distance < 8 bits (≈87% similarity), marked as duplicate

### Example

```javascript
// In uploadValidation.js
const hash1 = "1010101010101010..."; // 64 bits
const hash2 = "1010101010001010..."; // similar
const distance = hammingDistance(hash1, hash2); // e.g., 5
const duplicate = checkDuplicate(hash1, [hash2]);
// { isDuplicate: true, similarity: 92.2% }
```

## Keyword Detection

### Keywords Detected

- Question, Q1, Q.1
- Marks, Total Marks
- Time Allowed
- Semester
- Midterm, Final Term
- University

### Current Implementation

- Basic filename-based detection
- Scores 0-1 based on keywords found

### Production Enhancement

For better accuracy, use Tesseract.js:

```bash
npm install tesseract.js
```

```javascript
// Use OCR to extract text from image
import Tesseract from "tesseract.js";

const worker = await Tesseract.createWorker();
const {
  data: { text },
} = await worker.recognize(imageData);
// Analyze extracted text for keywords
```

## Error Handling

### Frontend Errors

- "File size must be ≤ 1 MB. Current size: X MB"
- "Invalid file type. Allowed types: PNG, JPG, JPEG"
- "Maximum 10 images allowed. You selected X"
- "Similar to an existing image (X% match)"

### Backend Errors

- Same validation errors returned from server
- File deletion on upload failure
- Detailed error logs in development

## Testing

### Test Case 1: Valid Upload

```bash
# Select 5 PNG files, each < 1 MB
# Expected: Success message
```

### Test Case 2: Large File

```bash
# Select a file > 1 MB
# Expected: "File size must be ≤ 1 MB" error
```

### Test Case 3: Invalid Type

```bash
# Select a .pdf file
# Expected: "Invalid file type" error
```

### Test Case 4: Too Many Files

```bash
# Select 15 files
# Expected: "Maximum 10 images allowed" error
```

### Test Case 5: Duplicate Detection

```bash
# Upload same image twice
# Expected: "Similar to existing image (99.9% match)" warning
```

## Configuration

To modify validation rules, edit:

**Frontend**: `/frontend/lib/uploadValidation.js`

```javascript
const VALIDATION_RULES = {
  MAX_FILE_SIZE: 1024 * 1024, // 1 MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
};
```

**Backend**: `/backend/controllers/paperController.js`

```javascript
const VALIDATION_RULES = {
  MAX_FILE_SIZE: 1024 * 1024, // 1 MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
};
```

## Next Steps

1. **Install image-hash package**:

   ```bash
   cd backend
   npm install image-hash
   ```

2. **Test the upload flow**

3. **(Optional) Add OCR for better keyword detection**:

   ```bash
   npm install tesseract.js
   ```

4. **Deploy** - Ensure uploads directory has proper permissions
