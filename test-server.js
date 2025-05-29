// Minimal test server to verify Railway deployment
const express = require('express');
const app = express();

console.log('🚀 Starting minimal test server...');

// Basic middleware
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  console.log('📡 Root endpoint hit');
  res.json({
    message: 'Test server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT || 'not set',
    railway: {
      domain: process.env.RAILWAY_PUBLIC_DOMAIN || 'not set'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check hit');
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Express error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 3001;

console.log('🔧 Configuration:', {
  PORT,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`✅ Railway URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  }
  
  console.log('✅ Server ready for requests!');
});

// Handle server errors
server.on('error', (error) => {
  console.error('💥 Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});