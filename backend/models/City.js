import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  country_code: String,
  latitude: Number,
  longitude: Number,
  population: Number,
  is_capital: Boolean,
  created_at: { type: Date, default: Date.now }
});

// Create indexes for better search performance
citySchema.index({ name: 1 });
citySchema.index({ country: 1 });
citySchema.index({ name: 'text', country: 'text' });

const City = mongoose.model('City', citySchema);

export default City;
