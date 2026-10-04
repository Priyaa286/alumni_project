const express = require('express');
const router = express.Router();
const nominationController = require('../controllers/nominationController');

// Nomination Form Routes
router.post('/nominations', nominationController.createNomination);
router.get('/nominations/:id', nominationController.getNominationById);
router.put('/nominations/:id', nominationController.updateNomination);
router.delete('/nominations/:id', nominationController.deleteNomination);

// Category List Route
router.get('/categories', nominationController.getCategories);

module.exports = router;
