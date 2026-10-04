const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Passwordless Auth Routes
router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/google', authController.googleAuth);
router.post('/auth/local-dev-login', authController.localDevLogin);
router.get('/auth/admin-info', authController.getAdminInfo);

module.exports = router;
