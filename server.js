const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// CRITICAL: Define PORT early - FIXED FOR RAILWAY
const PORT = process.env.PORT || 8080; // Changed from 3001 to 8080

// Get server URL based on environment
function getServerUrl() {
  if (process.env.NODE_ENV === 'production') {
    // Railway provides RAILWAY_PUBLIC_DOMAIN
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  
  // Development fallback
  return `http://localhost:${PORT}`;
}

const SERVER_URL = getServerUrl();

console.log('🚀 Starting Medical Consultation Server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Server URL:', SERVER_URL);
console.log('Railway Domain:', process.env.RAILWAY_PUBLIC_DOMAIN);
console.log('Port:', PORT);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// DIAGNOSTIC: Check if build folder exists
const buildPath = path.join(__dirname, 'build');
console.log('Looking for build folder at:', buildPath);

try {
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build folder found!');
    const buildContents = fs.readdirSync(buildPath);
    console.log('📁 Build folder contents:', buildContents);
    
    // Check for index.html specifically
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html found in build folder');
    } else {
      console.log('❌ index.html NOT found in build folder');
    }
  } else {
    console.log('❌ Build folder NOT found at:', buildPath);
    
    // List what IS in the current directory
    console.log('📁 Current directory contents:');
    try {
      const currentDirContents = fs.readdirSync(__dirname);
      console.log(currentDirContents);
    } catch (err) {
      console.log('Error reading current directory:', err.message);
    }
  }
} catch (error) {
  console.log('❌ Error checking build folder:', error.message);
}

// 1) Health-check endpoint FIRST so it's never shadowed by any middleware
app.get('/health', (req, res) => {
  console.log('🔍 /health probe hit');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Back-compat for some platforms that probe /healthz
app.get('/healthz', (req, res) => res.redirect('/health'));

// 2) CORS configuration for Railway
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://localhost:3000",
    
    // Railway domains
    /^https:\/\/.*\.railway\.app$/,
    /^https:\/\/.*\.up\.railway\.app$/,
    
    "https://my-wellbeing-new01-production.up.railway.app",
    
    // Development - only for local testing
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:3000$/
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// --- Forum API routes integration ---
const forumTopicsRoutes = require('./src/forum_backend/forum/routes/topics');
const forumRepliesRoutes = require('./src/forum_backend/forum/routes/replies');
const forumUsersRoutes = require('./src/forum_backend/forum/routes/users');
const forumStatsRoutes = require('./src/forum_backend/forum/routes/stats');
const forumAuthRoutes = require('./src/forum_backend/forum/routes/auth');

app.use('/api/topics', forumTopicsRoutes);
app.use('/api/replies', forumRepliesRoutes);
app.use('/api/users', forumUsersRoutes);
app.use('/api/stats', forumStatsRoutes);
app.use('/api/auth', forumAuthRoutes);
// --- End Forum API routes integration ---

// IMPROVED: Static file serving with better error handling
if (fs.existsSync(buildPath)) {
  console.log('🎯 Setting up static file serving from:', buildPath);
  
  // Serve static files from build directory
  app.use(express.static(buildPath, {
    maxAge: '1d', // Cache for 1 day in production
    etag: true,
    lastModified: true
  }));
  
  console.log('✅ Static file middleware configured');
} else {
  console.log('⚠️ Skipping static file serving - build folder not found');
}

// Store active rooms and their participants
const rooms = new Map();
const userSocketMap = new Map();
const socketUserMap = new Map();
const connectionTimestamps = new Map();

// CRITICAL: API endpoints BEFORE catch-all route
app.get('/api/health', (req, res) => {
  const roomsInfo = Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    users: Array.from(users),
    userCount: users.size
  }));

  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    railway: {
      publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN,
      serviceName: process.env.RAILWAY_SERVICE_NAME
    },
    server: {
      uptime: process.uptime(),
      connections: io ? io.engine.clientsCount : 0,
      rooms: {
        total: rooms.size,
        active: roomsInfo
      }
    },
    peerServer: {
      path: '/peerjs/myapp',
      status: 'running'
    },
    buildFolder: {
      exists: fs.existsSync(buildPath),
      path: buildPath
    }
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Medical Consultation WebRTC Server API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    server: {
      url: SERVER_URL,
      port: PORT,
      railway: {
        domain: process.env.RAILWAY_PUBLIC_DOMAIN,
        service: process.env.RAILWAY_SERVICE_NAME
      }
    },
    endpoints: {
      health: '/api/health',
      peerjs: '/peerjs/myapp'
    }
  });
});

// Configure Socket.IO for Railway
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// PeerJS server configuration for Railway
const peerServer = ExpressPeerServer(server, {
  debug: process.env.NODE_ENV !== 'production',
  path: '/myapp',
  proxied: process.env.NODE_ENV === 'production', // CRITICAL for Railway
  allow_discovery: true,
  generateClientId: () => {
    return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
  },
  corsOptions: corsOptions
});

app.use('/peerjs', peerServer);

// PeerJS server events
peerServer.on('connection', (client) => {
  const timestamp = new Date().toISOString();
  connectionTimestamps.set(client.getId(), timestamp);
  console.log('🔗 Peer connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
  console.log('🔗 Peer disconnected:', client.getId());
  connectionTimestamps.delete(client.getId());
});

peerServer.on('error', (error) => {
  console.error('💥 PeerJS error:', error.message);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);
  
  socket.on('join-room', (roomId, userId) => {
    console.log(`👤 User ${userId} joining room ${roomId}`);
    
    // Validation
    if (!roomId || typeof roomId !== 'string' || roomId.length < 3) {
      socket.emit('error', { message: 'Invalid room ID' });
      return;
    }
    
    if (!userId || typeof userId !== 'string' || userId.length < 3) {
      socket.emit('error', { message: 'Invalid user ID' });
      return;
    }
    
    try {
      // Join room
      socket.join(roomId);
      
      // Initialize room if needed
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      const room = rooms.get(roomId);
      
      // Clean up old mappings
      if (userSocketMap.has(userId)) {
        const oldSocketId = userSocketMap.get(userId);
        socketUserMap.delete(oldSocketId);
      }
      
      // Store mappings
      userSocketMap.set(userId, socket.id);
      socketUserMap.set(socket.id, userId);
      socket.userId = userId;
      socket.roomId = roomId;
      
      // Add to room
      room.add(userId);
      
      console.log(`Room ${roomId} now has ${room.size} users`);
      
      // Notify others
      socket.broadcast.to(roomId).emit('user-connected', userId);
      
      // Confirm to user
      socket.emit('room-joined', {
        roomId,
        userId,
        roomSize: room.size,
        success: true
      });
      
    } catch (error) {
      console.error('❌ Error in join-room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  socket.on('signal', (data) => {
    try {
      const roomId = data.roomId || socket.roomId;
      const fromUserId = data.fromUserId || socket.userId;
      
      if (!roomId || !fromUserId) {
        socket.emit('error', { message: 'Missing room or user ID for signal' });
        return;
      }
      
      const room = rooms.get(roomId);
      if (!room || !room.has(fromUserId)) {
        socket.emit('error', { message: 'User not in room' });
        return;
      }
      
      const signalData = {
        ...data,
        fromUserId: fromUserId,
        timestamp: Date.now()
      };
      
      if (data.toUserId) {
        const targetSocketId = userSocketMap.get(data.toUserId);
        if (targetSocketId && io.sockets.sockets.has(targetSocketId)) {
          io.to(targetSocketId).emit('signal', signalData);
        }
      } else {
        socket.broadcast.to(roomId).emit('signal', signalData);
      }
    } catch (error) {
      console.error('❌ Signal error:', error);
      socket.emit('error', { message: 'Signal processing failed' });
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', socket.id, reason);
    handleUserLeaving(socket, socket.roomId);
  });
  
  socket.on('error', (error) => {
    console.error('💣 Socket error:', error);
  });
});

// Helper function for user leaving
function handleUserLeaving(socket, roomId) {
  try {
    const userId = socket.userId;
    
    if (userId && roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.delete(userId);
        
        socket.broadcast.to(roomId).emit('user-disconnected', userId);
        
        if (room.size === 0) {
          rooms.delete(roomId);
        }
      }
      
      userSocketMap.delete(userId);
    }
    
    socketUserMap.delete(socket.id);
  } catch (error) {
    console.error('❌ Error in handleUserLeaving:', error);
  }
}

// IMPORTANT: Catch-all route for SPA (MUST be LAST)
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  console.log('🔍 Catch-all route hit for:', req.path);
  console.log('🔍 Looking for index.html at:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Serving index.html');
    res.sendFile(indexPath);
  } else {
    console.log('❌ index.html not found, sending API response');
    res.status(404).json({
      error: 'Frontend not found',
      message: 'This appears to be a backend API server. Frontend may need to be built or deployed separately.',
      availableEndpoints: [
        '/api/health',
        '/api/status',
        '/peerjs/myapp'
      ],
      buildPath: buildPath,
      buildExists: fs.existsSync(buildPath)
    });
  }
});

// Error handling
server.on('error', (error) => {
  console.error('💥 Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  
  // Don't crash for WebSocket errors
  if (error.message && error.message.includes('WebSocket')) {
    return;
  }
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`🔄 ${signal} received, shutting down...`);
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
}

// Start server - CRITICAL: Use Railway's PORT and bind to 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`✅ Railway URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    console.log(`🌐 Try: https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/health`);
  }
  
  console.log('✅ Ready for video consultations!');
});