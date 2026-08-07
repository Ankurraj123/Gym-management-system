require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes & Aliases
const authRoutes = require('./routes/auth');
const memberPortalRoutes = require('./routes/memberPortal');

app.use('/api/auth', authRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/member', authRoutes);
app.use('/api/member', memberPortalRoutes);
app.use('/api/member-portal', memberPortalRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/members', require('./routes/members'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reports', require('./routes/reports'));

app.get('/', (req, res) => res.json({ message: 'Titanium Fitness Unified API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gym_management_admin';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
