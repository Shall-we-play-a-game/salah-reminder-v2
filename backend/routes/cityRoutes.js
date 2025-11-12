import express from 'express';
import { search, getAll, byCountry } from '../controllers/cityController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/search', search);
router.get('/country/:countryName', byCountry);

export default router;
