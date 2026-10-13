const multer = require('multer');
const path = require('path');

// Use in-memory storage to prevent EROFS (Read-only file system) errors on Vercel/serverless environments
const storage = multer.memoryStorage();

// File filter for allowed extensions & document/image formats
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    // Document formats
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt', '.ods', '.odp', '.csv',
    // Image formats
    '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic', '.heif', '.svg'
  ];

  const allowedMimeTypes = [
    // PDF & Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    // Images
    'image/png',
    'image/jpeg',
    'image/pjpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    'image/svg+xml',
    'application/octet-stream'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowedExtensions.includes(ext);
  const isValidMime = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${ext || file.mimetype}). Allowed formats: PDF, DOCX, DOC, XLS, PPT, TXT, PNG, JPG, JPEG, WEBP, etc.`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB Limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
