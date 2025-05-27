// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './Backend.env' });

// Import routes
const topicRoutes = require('./routes/topics');
const replyRoutes = require('./routes/replies');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - explicitly allowing frontend requests
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API routes
app.use('/api/topics', topicRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 2MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Accepting requests from ${corsOptions.origin}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

module.exports = app;