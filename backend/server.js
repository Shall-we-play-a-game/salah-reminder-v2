import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const PORT = 8001;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'test_database';

mongoose.connect(`${MONGO_URL}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// ==================== SCHEMAS ====================

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

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mosque_id: String,  // Optional for city/country level posts
  admin_id: { type: String, required: true },
  title: { type: String, required: true },
  content: String,  // Optional if image is provided
  image: String,  // base64 encoded image - optional
  scope: { type: String, required: true, enum: ['mosque', 'city', 'country'], default: 'mosque' },
  city: String,
  country: String,
  event_start_date: Date,
  event_end_date: Date,
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  created_at: { type: Date, default: Date.now }
});

const Mosque = mongoose.model('Mosque', mosqueSchema);
const User = mongoose.model('User', userSchema);
const PrayerTime = mongoose.model('PrayerTime', prayerTimeSchema);
const Post = mongoose.model('Post', postSchema);

// ==================== HELPER FUNCTIONS ====================

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// ==================== ROUTES ====================

app.get('/api', (req, res) => {
  res.json({ message: 'Salah Reminder API' });
});

// ========== MOSQUE ROUTES ==========

app.get('/api/mosques', async (req, res) => {
  try {
    const mosques = await Mosque.find({}, { _id: 0, __v: 0 });
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mosques/:mosque_id', async (req, res) => {
  try {
    const mosque = await Mosque.findOne({ id: req.params.mosque_id }, { _id: 0, __v: 0 });
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    res.json(mosque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mosques', async (req, res) => {
  try {
    const mosqueData = {
      id: generateId(),
      ...req.body
    };
    const mosque = new Mosque(mosqueData);
    await mosque.save();
    res.json(mosque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mosques/:mosque_id/donation-qr', upload.single('file'), async (req, res) => {
  try {
    const base64Image = req.file.buffer.toString('base64');
    const mosque = await Mosque.findOneAndUpdate(
      { id: req.params.mosque_id },
      { donation_qr_code: base64Image },
      { new: true }
    );
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    res.json({ message: 'QR code uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== USER/AUTH ROUTES ==========

app.post('/api/auth/register', upload.fields([{ name: 'id_proof' }, { name: 'donation_qr' }]), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }
    
    const passwordHash = await hashPassword(password);
    let mosqueId = null;
    
    if (role === 'admin') {
      const {
        mosque_name, mosque_phone, mosque_alternate_phone,
        mosque_address, mosque_district, mosque_city,
        mosque_state, mosque_country, mosque_latitude, mosque_longitude
      } = req.body;
      
      if (!mosque_name || !mosque_phone || !mosque_address || !mosque_district || !mosque_city || !mosque_state || !mosque_country) {
        return res.status(400).json({ detail: 'All mosque fields are required for admin registration' });
      }
      
      if (!req.files || !req.files.id_proof) {
        return res.status(400).json({ detail: 'ID proof is required for admin registration' });
      }
      
      const idProofBase64 = req.files.id_proof[0].buffer.toString('base64');
      const donationQrBase64 = req.files.donation_qr ? req.files.donation_qr[0].buffer.toString('base64') : null;
      
      // Create mosque
      mosqueId = generateId();
      const mosque = new Mosque({
        id: mosqueId,
        name: mosque_name,
        phone: mosque_phone,
        alternate_phone: mosque_alternate_phone,
        address: mosque_address,
        district: mosque_district,
        city: mosque_city,
        state: mosque_state,
        country: mosque_country,
        latitude: mosque_latitude ? parseFloat(mosque_latitude) : null,
        longitude: mosque_longitude ? parseFloat(mosque_longitude) : null,
        donation_qr_code: donationQrBase64
      });
      await mosque.save();
      
      // Create admin user
      const user = new User({
        id: generateId(),
        email,
        password_hash: passwordHash,
        role,
        mosque_id: mosqueId,
        id_proof: idProofBase64,
        status: 'pending'
      });
      await user.save();
      
      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        mosque_id: user.mosque_id,
        status: user.status,
        created_at: user.created_at
      });
    } else {
      // Regular user
      const user = new User({
        id: generateId(),
        email,
        password_hash: passwordHash,
        role,
        status: 'approved'
      });
      await user.save();
      
      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        mosque_id: user.mosque_id,
        status: user.status,
        created_at: user.created_at
      });
    }
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }
    
    if (user.role === 'admin' && user.status !== 'approved') {
      return res.status(403).json({ detail: 'Admin account pending approval' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      mosque_id: user.mosque_id,
      status: user.status,
      created_at: user.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/pending', async (req, res) => {
  try {
    const users = await User.find({ role: 'admin', status: 'pending' }, { _id: 0, __v: 0, password_hash: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:user_id/id-proof', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    res.json({ id_proof: user.id_proof });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/users/:user_id/status', async (req, res) => {
  try {
    const { status } = req.query;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status' });
    }
    
    const user = await User.findOneAndUpdate(
      { id: req.params.user_id },
      { status },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favorite mosques
app.post('/api/users/:user_id/favorites/:mosque_id', async (req, res) => {
  try {
    const mosque = await Mosque.findOne({ id: req.params.mosque_id });
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    
    const user = await User.findOneAndUpdate(
      { id: req.params.user_id },
      { $addToSet: { favorite_mosques: req.params.mosque_id } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json({ message: 'Mosque added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:user_id/favorites/:mosque_id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.user_id },
      { $pull: { favorite_mosques: req.params.mosque_id } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json({ message: 'Mosque removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:user_id/favorites', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    const mosques = await Mosque.find({ id: { $in: user.favorite_mosques } }, { _id: 0, __v: 0 });
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PRAYER TIMES ROUTES ==========

app.get('/api/prayer-times/:mosque_id', async (req, res) => {
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
});

app.post('/api/prayer-times', async (req, res) => {
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
});

// ========== POSTS/FEED ROUTES ==========

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { admin_id, mosque_id } = req.query;
    const { title, content } = req.body;
    
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }
    
    const post = new Post({
      id: generateId(),
      mosque_id,
      admin_id,
      title,
      content,
      image: imageBase64
    });
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const { mosque_id, status } = req.query;
    const query = {};
    
    if (mosque_id) query.mosque_id = mosque_id;
    if (status) query.status = status;
    
    const posts = await Post.find(query, { _id: 0, __v: 0 }).sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/pending', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' }, { _id: 0, __v: 0 }).sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/posts/:post_id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status' });
    }
    
    const post = await Post.findOneAndUpdate(
      { id: req.params.post_id },
      { status },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ detail: 'Post not found' });
    }
    
    res.json({ message: 'Post status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
