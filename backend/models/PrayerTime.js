import mongoose from 'mongoose';

const prayerTimeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mosque_id: { type: String, required: true },
  date: { type: String, required: true },
  fajr: { type: String, required: true },
  dhuhr: { type: String, required: true },
  asr: { type: String, required: true },
  maghrib: { type: String, required: true },
  isha: { type: String, required: true },
  is_manual: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const PrayerTime = mongoose.model('PrayerTime', prayerTimeSchema);

export default PrayerTime;
