const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const nominationRoutes = require('./routes/nominationRoutes');
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const otpRoutes = require('./routes/otpRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const mongoose = require('mongoose');

// Initialize database connection
connectDB();

const app = express();

// Middleware to ensure DB connection attempt on serverless requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  next();
});

// Middlewares
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' })); // Support larger JSON payloads (signature canvas and text data)
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static route to serve uploaded files (previews & downloads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', nominationRoutes);
app.use('/api', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api', memberRoutes);
app.use('/api', uploadRoutes);

// Root route placeholder
app.get('/', (req, res) => {
  res.send('NEC Alumni Award Nomination Portal API is running...');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
