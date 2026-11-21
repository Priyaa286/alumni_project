const express = require('express');
const router = express.Router();
const { handleNotableAlumniSSO, getUserByEmail } = require('../controllers/notableAlumni.controller');

// SSO callback handler: /sso?token=...
router.get('/sso', handleNotableAlumniSSO);

// User lookup endpoint: /user-by-email?email=...
router.get('/user-by-email', getUserByEmail);

module.exports = router;
