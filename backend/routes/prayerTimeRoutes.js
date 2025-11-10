import express from 'express';
import { getPrayerTimes, createPrayerTime } from '../controllers/prayerTimeController.js';

const router = express.Router();

router.get('/:mosque_id', getPrayerTimes);
router.post('/', createPrayerTime);

export default router;
