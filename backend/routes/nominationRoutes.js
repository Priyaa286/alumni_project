const express = require('express');
const router = express.Router();
const nominationController = require('../controllers/nominationController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Nomination Form Routes
router.post('/nominations', nominationController.createNomination);
router.get('/nominations/:id', nominationController.getNominationById);
router.put('/nominations/:id', nominationController.updateNomination);
router.delete('/nominations/:id', nominationController.deleteNomination);

// Admin Routes (Protected by Authorization Middleware)
router.get('/admin/nominations', verifyAdmin, nominationController.getAllNominations);

// Category List Route
router.get('/categories', nominationController.getCategories);

module.exports = router;

