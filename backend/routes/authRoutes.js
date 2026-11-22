const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth Routes (Single Sign-On & Admin)
router.post('/auth/google', authController.googleAuth);
router.post('/auth/local-dev-login', authController.localDevLogin);
router.get('/auth/admin-info', authController.getAdminInfo);

module.exports = router;
