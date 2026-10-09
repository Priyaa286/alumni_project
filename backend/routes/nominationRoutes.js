const express = require('express');
const router = express.Router();
const nominationController = require('../controllers/nominationController');
const { authenticate, verifyAdmin } = require('../middleware/authMiddleware');

// Nomination Form Routes
router.post('/nominations', nominationController.createNomination);
router.get('/nominations/:id', verifyAdmin, nominationController.getNominationById);
router.put('/nominations/:id', verifyAdmin, nominationController.updateNomination);
router.delete('/nominations/:id', verifyAdmin, nominationController.deleteNomination);

router.get('/nomination-status', nominationController.getNominationWindow);
router.get('/leaderboard', nominationController.getLeaderboard);
router.post('/nominee-approval/:token', nominationController.respondToNomineeApproval);
router.get('/nominee-approval/:token', nominationController.getNomineeApproval);

router.get('/admin/nominations', verifyAdmin, nominationController.getAllNominations);
router.post('/admin/nominations', verifyAdmin, (req, res, next) => {
  req.isBackOffice = true;
  next();
}, nominationController.createNomination);
router.put('/admin/nominations/:id/verify', verifyAdmin, nominationController.verifyNomination);
router.put('/admin/nominations/:id/review', verifyAdmin, nominationController.saveReviewAssessment);
router.put('/admin/nominations/:id/award-result', verifyAdmin, nominationController.setAwardResult);
router.post('/admin/nominations/:id/resend-approval', verifyAdmin, nominationController.resendNomineeApproval);
router.put('/admin/nomination-window', verifyAdmin, nominationController.setNominationWindow);

// Category List Route
router.get('/categories', nominationController.getCategories);

module.exports = router;
