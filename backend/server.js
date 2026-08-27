const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const nominationRoutes = require('./routes/nominationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));
app.use(express.json({ limit: '15mb' })); // Support larger JSON payloads (signature canvas and text data)
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static route to serve uploaded files (previews & downloads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', nominationRoutes);
app.use('/api', uploadRoutes);

// Root route placeholder
app.get('/', (req, res) => {
  res.send('NEC Alumni Award Nomination Portal API is running...');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
