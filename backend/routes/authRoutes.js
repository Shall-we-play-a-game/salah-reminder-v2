import express from 'express';
import { register, login } from '../controllers/authController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', upload.fields([{ name: 'id_proof' }, { name: 'donation_qr' }]), register);
router.post('/login', login);

export default router;
