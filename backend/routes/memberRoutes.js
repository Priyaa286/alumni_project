const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate } = require('../middleware/authMiddleware');

// GET lookup member by email (upto batch 2026)
router.get('/members/lookup', authenticate, memberController.lookupMemberByEmail);

module.exports = router;
