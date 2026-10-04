// Simple file upload response controller
// Supports local file path return, structured to be Cloudinary ready

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided or file rejected by validation rules.'
      });
    }

    // By default, we use local storage paths.
    // The path is served statically relative to the server URL.
    const fileUrl = `/uploads/${req.file.filename}`;

    // Cloudinary Integration Mock (Ready to Toggle)
    // To enable, fill in Cloudinary credentials in .env and install 'cloudinary' package
    if (
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
    ) {
      console.log(`[Cloudinary] Detected credentials. Uploading file: ${req.file.filename}`);
      
      // const cloudinary = require('cloudinary').v2;
      // cloudinary.config({
      //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      //   api_key: process.env.CLOUDINARY_API_KEY,
      //   api_secret: process.env.CLOUDINARY_API_SECRET
      // });
      //
      // const result = await cloudinary.uploader.upload(req.file.path, {
      //   resource_type: 'auto',
      //   folder: 'nec_nominations'
      // });
      // return res.status(200).json({
      //   success: true,
      //   message: 'Uploaded to Cloudinary',
      //   fileUrl: result.secure_url,
      //   fileName: req.file.originalname
      // });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully to local storage.',
      fileUrl: fileUrl,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
};
