import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'admin', 'superadmin'] },
  mosque_id: String,
  id_proof: String,
  favorite_mosques: [String],
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;
