import express from 'express';
import { search, popular, byCountry } from '../controllers/cityController.js';

const router = express.Router();

router.get('/search', search);
router.get('/popular', popular);
router.get('/country/:countryCode', byCountry);

export default router;
