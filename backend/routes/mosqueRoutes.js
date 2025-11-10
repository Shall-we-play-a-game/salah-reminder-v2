import express from 'express';
import { getAllMosques, getMosqueById, createMosque, uploadDonationQR } from '../controllers/mosqueController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllMosques);
router.get('/:mosque_id', getMosqueById);
router.post('/', createMosque);
router.post('/:mosque_id/donation-qr', upload.single('file'), uploadDonationQR);

export default router;
