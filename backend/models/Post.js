import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mosque_id: String,
  admin_id: { type: String, required: true },
  title: { type: String, required: true },
  content: String,
  image: String,
  scope: { type: String, required: true, enum: ['mosque', 'city', 'country'], default: 'mosque' },
  city: String,
  country: String,
  event_start_date: Date,
  event_end_date: Date,
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  created_at: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
