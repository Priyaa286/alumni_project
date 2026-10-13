const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Helper to get or wait for MongoDB connection
const ensureDbConnection = async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose.connection.db;
  }
  const connectDB = require('../config/db');
  await connectDB();
  return (mongoose.connection.readyState === 1 && mongoose.connection.db) ? mongoose.connection.db : null;
};

// Upload single file
// Priority: Cloudinary (if credentials exist) -> MongoDB GridFS (persistent on serverless/Vercel) -> Local disk fallback
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file provided or file rejected by validation rules.'
      });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname) || '';
    const filename = `${uniqueSuffix}${ext}`;

    // 1. Cloudinary Integration (if configured in environment)
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: 'auto',
                folder: 'nec_nominations'
              },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });
        };

        const result = await uploadToCloudinary();
        return res.status(200).json({
          success: true,
          message: 'File uploaded successfully to Cloudinary.',
          fileUrl: result.secure_url,
          fileName: req.file.originalname
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, falling back to database storage:', cloudErr.message);
      }
    }

    // 2. MongoDB GridFS Storage (Default for production & serverless to avoid EROFS)
    const db = await ensureDbConnection();
    if (db) {
      const { GridFSBucket } = mongoose.mongo;
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date()
        }
      });

      await new Promise((resolve, reject) => {
        uploadStream.on('error', reject);
        uploadStream.on('finish', resolve);
        uploadStream.end(req.file.buffer);
      });

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully to database storage.',
        fileUrl: `/api/uploads/${filename}`,
        fileName: req.file.originalname
      });
    }

    // 3. Local disk fallback (for development when MongoDB is not connected)
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully to local storage.',
        fileUrl: `/api/uploads/${filename}`,
        fileName: req.file.originalname
      });
    } catch (diskErr) {
      console.error('Local disk write failed:', diskErr);
      throw new Error('Storage unavailable: Database is not connected and file system is read-only.');
    }
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
};

// Retrieve uploaded file by filename
exports.getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is required' });
    }

    // 1. Check local disk first (for backwards compatibility with existing local uploads)
    const localPath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(localPath)) {
      return res.sendFile(path.resolve(localPath));
    }

    // 2. Check MongoDB GridFS
    const db = await ensureDbConnection();
    if (db) {
      const { GridFSBucket } = mongoose.mongo;
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

      const files = await bucket.find({ filename }).toArray();
      if (files && files.length > 0) {
        const fileDoc = files[0];
        const contentType = fileDoc.contentType || fileDoc.metadata?.contentType || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${fileDoc.metadata?.originalName || fileDoc.filename}"`);
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        const downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.on('error', (err) => {
          console.error('GridFS stream error:', err);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error streaming file' });
          }
        });
        return downloadStream.pipe(res);
      }
    }

    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving file'
    });
  }
};
