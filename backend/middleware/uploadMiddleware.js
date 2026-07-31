import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File Validation filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed files: ${allowedExtensions.join(', ')}`), false);
  }
};

// Export Multer configuration (Max 10MB per file)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

/*
 * CLOUDINARY READY PLACEHOLDER:
 * To switch to Cloudinary, uncomment below and integrate with cloudinary sdk.
 * 
 * import { v2 as cloudinary } from 'cloudinary';
 * import { CloudinaryStorage } from 'multer-storage-cloudinary';
 * 
 * cloudinary.config({
 *   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 *   api_key: process.env.CLOUDINARY_API_KEY,
 *   api_secret: process.env.CLOUDINARY_API_SECRET
 * });
 * 
 * const cloudinaryStorage = new CloudinaryStorage({
 *   cloudinary: cloudinary,
 *   params: {
 *     folder: 'nec_alumni_nominations',
 *     allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx']
 *   }
 * });
 * 
 * export const uploadCloudinary = multer({ storage: cloudinaryStorage });
 */
