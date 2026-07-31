import express from 'express';
import {
  createNomination,
  getNominationById,
  updateNomination,
  deleteNomination,
  getCategories,
  uploadFile
} from '../controllers/nominationController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Nomination Routes
router.post('/nominations', createNomination);
router.get('/nominations/:id', getNominationById);
router.put('/nominations/:id', updateNomination);
router.delete('/nominations/:id', deleteNomination);

// Utility Routes
router.get('/categories', getCategories);
router.post('/upload', upload.single('file'), uploadFile);

export default router;
