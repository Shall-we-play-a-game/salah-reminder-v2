import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import mosqueRoutes from './routes/mosqueRoutes.js';
import userRoutes from './routes/userRoutes.js';
import prayerTimeRoutes from './routes/prayerTimeRoutes.js';
import postRoutes from './routes/postRoutes.js';

dotenv.config();

const app = express();
const PORT = 8001;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// ==================== ROUTES ====================

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'Salah Reminder API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mosques', mosqueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prayer-times', prayerTimeRoutes);
app.use('/api/posts', postRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
