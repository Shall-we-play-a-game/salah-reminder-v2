import PrayerTime from '../models/PrayerTime.js';
import Mosque from '../models/Mosque.js';
import axios from 'axios';
import { generateId } from '../utils/helpers.js';

export const getPrayerTimes = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Check for manual times
    let prayerTime = await PrayerTime.findOne(
      { mosque_id: req.params.mosque_id, date, is_manual: true },
      { _id: 0, __v: 0 }
    );
    
    if (prayerTime) {
      return res.json(prayerTime);
    }
    
    // Check for cached times
    prayerTime = await PrayerTime.findOne(
      { mosque_id: req.params.mosque_id, date },
      { _id: 0, __v: 0 }
    );
    
    if (prayerTime) {
      return res.json(prayerTime);
    }
    
    // Fetch from Aladhan API
    const mosque = await Mosque.findOne({ id: req.params.mosque_id });
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    
    try {
      const response = await axios.get(`http://api.aladhan.com/v1/timings/${date}`, {
        params: {
          latitude: mosque.latitude || 0,
          longitude: mosque.longitude || 0,
          method: 2
        }
      });
      
      const timings = response.data.data.timings;
      const newPrayerTime = new PrayerTime({
        id: generateId(),
        mosque_id: req.params.mosque_id,
        date,
        fajr: timings.Fajr,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        is_manual: false
      });
      
      await newPrayerTime.save();
      res.json(newPrayerTime);
    } catch (error) {
      res.status(500).json({ detail: 'Failed to fetch prayer times' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPrayerTime = async (req, res) => {
  try {
    const { mosque_id, date } = req.body;
    
    // Delete existing entry
    await PrayerTime.deleteMany({ mosque_id, date });
    
    const prayerTime = new PrayerTime({
      id: generateId(),
      ...req.body,
      is_manual: true
    });
    
    await prayerTime.save();
    res.json(prayerTime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
