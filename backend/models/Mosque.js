import mongoose from 'mongoose';

const mosqueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  alternate_phone: String,
  address: { type: String, required: true },
  district: String,
  city: { type: String, required: true },
  state: String,
  country: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  donation_qr_code: String,
  created_at: { type: Date, default: Date.now }
});

const Mosque = mongoose.model('Mosque', mosqueSchema);

export default Mosque;
