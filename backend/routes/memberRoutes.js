const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// GET lookup member by email (upto batch 2026)
router.get('/members/lookup', memberController.lookupMemberByEmail);

module.exports = router;
