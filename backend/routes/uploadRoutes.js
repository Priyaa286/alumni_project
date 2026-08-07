const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');

// Upload single file endpoint
router.post('/upload', uploadMiddleware.single('file'), uploadController.uploadFile);

module.exports = router;
