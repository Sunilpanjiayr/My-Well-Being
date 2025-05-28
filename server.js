const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Add a specific endpoint for default avatars
app.get('/avatars/default/:gender', (req, res) => {
  const { gender } = req.params;
  const defaultAvatarPath = gender === 'male' ? 'public/avatars/man_avatar.jpg' : 'public/avatars/woman_avatar.jpg';
  
  // Check if file exists and serve it
  const fs = require('fs');
  const path = require('path');
  
  if (fs.existsSync(defaultAvatarPath)) {
    res.sendFile(path.resolve(defaultAvatarPath));
  } else {
    res.status(404).json({ error: 'Avatar not found' });
  }
});

// API endpoint to serve user avatars (combines Firebase URLs and local defaults)
app.get('/api/avatar/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // This endpoint can be used to serve avatars consistently
    // For now, it returns the avatar URL from the database
    res.json({
      message: 'Avatar endpoint ready',
      userId: userId,
      note: 'Avatars are served directly from Firebase Storage URLs'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

// Configure Socket.IO
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// FIXED: Simplified PeerJS server configuration
const peerServer = ExpressPeerServer(server, {
  debug: false, // Disable debug to reduce noise
  path: '/myapp',
  port: 3001,
  // Remove the createWebSocketServer option that was causing issues
  allow_discovery: true,
  proxied: false,
  // Add proper error handling
  generateClientId: () => {
    return Math.random().toString(36).substr(2, 9);
  }
});

// Mount PeerJS server
app.use('/peerjs', peerServer);

// Store active rooms and their participants
const rooms = new Map();
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId

// Health check endpoint
app.get('/health', (req, res) => {
  const roomsInfo = Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    users: Array.from(users),
    userCount: users.size
  }));

  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      connections: io.engine.clientsCount,
      rooms: {
        total: rooms.size,
        active: roomsInfo
      }
    },
    peerServer: {
      path: '/peerjs/myapp',
      status: 'running'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Medical Consultation WebRTC Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      peerjs: '/peerjs/myapp'
    }
  });
});

// PeerJS server events with better error handling
peerServer.on('connection', (client) => {
  console.log(`\n🔗 PEER CONNECTION`);
  console.log(`   Peer ID: ${client.getId()}`);
  console.log(`   Time: ${new Date().toISOString()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`\n🔗 PEER DISCONNECTION`);
  console.log(`   Peer ID: ${client.getId()}`);
  console.log(`   Time: ${new Date().toISOString()}`);
});

// Add error handling for PeerJS server
peerServer.on('error', (error) => {
  console.error(`\n💥 PEER SERVER ERROR:`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Code: ${error.code}`);
  // Don't crash the server for peer errors
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`\n🔌 NEW SOCKET CONNECTION`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Total connections: ${io.engine.clientsCount}`);
  
  // Handle room joining
  socket.on('join-room', (roomId, userId) => {
    console.log(`\n👤 USER JOINING ROOM`);
    console.log(`   Room ID: ${roomId}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Socket ID: ${socket.id}`);
    
    // Validate inputs
    if (!roomId || !userId) {
      console.error(`   ❌ Invalid room ID or user ID`);
      socket.emit('error', { message: 'Invalid room ID or user ID' });
      return;
    }
    
    try {
      // Leave any previous rooms
      const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      previousRooms.forEach(room => {
        socket.leave(room);
        console.log(`   Left previous room: ${room}`);
        
        // Remove from previous room's user list
        if (rooms.has(room)) {
          const prevRoom = rooms.get(room);
          prevRoom.delete(socket.userId);
          if (prevRoom.size === 0) {
            rooms.delete(room);
            console.log(`   Deleted empty room: ${room}`);
          }
        }
      });
      
      // Join the new room
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
        console.log(`   Created new room: ${roomId}`);
      }
      
      const room = rooms.get(roomId);
      
      // Store user mappings
      userSocketMap.set(userId, socket.id);
      socketUserMap.set(socket.id, userId);
      socket.userId = userId;
      socket.roomId = roomId;
      
      // Add user to room
      room.add(userId);
      
      console.log(`   Room ${roomId} now has ${room.size} users: [${Array.from(room).join(', ')}]`);
      
      // Get other users in the room (excluding the joining user)
      const otherUsers = Array.from(room).filter(id => id !== userId);
      
      // Notify others in the room about the new user
      socket.broadcast.to(roomId).emit('user-connected', userId);
      console.log(`   Broadcasted 'user-connected' for ${userId} to ${otherUsers.length} other users`);
      
      // Send confirmation to the joining user
      socket.emit('room-joined', {
        roomId,
        userId,
        roomSize: room.size,
        otherUsers: otherUsers,
        success: true
      });
      
      console.log(`✅ User ${userId} successfully joined room ${roomId}`);
      
    } catch (error) {
      console.error(`❌ Error in join-room:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Handle signaling for WebRTC
  socket.on('signal', (data) => {
    try {
      console.log(`\n📡 SIGNAL RECEIVED`);
      console.log(`   From: ${data.fromUserId || socket.userId || 'unknown'}`);
      console.log(`   To: ${data.toUserId || 'broadcast'}`);
      console.log(`   Type: ${data.type || 'webrtc-signal'}`);
      console.log(`   Room: ${data.roomId || socket.roomId}`);
      
      const roomId = data.roomId || socket.roomId;
      const fromUserId = data.fromUserId || socket.userId;
      
      if (!roomId) {
        console.warn(`   ⚠️ No room ID provided for signal`);
        socket.emit('error', { message: 'No room ID for signal' });
        return;
      }
      
      if (!fromUserId) {
        console.warn(`   ⚠️ No sender user ID provided for signal`);
        return;
      }
      
      // Prepare signal data
      const signalData = {
        ...data,
        fromUserId: fromUserId,
        timestamp: Date.now()
      };
      
      // Forward the signal
      if (data.toUserId) {
        // Send to specific user
        const targetSocketId = userSocketMap.get(data.toUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit('signal', signalData);
          console.log(`   ✅ Signal forwarded to specific user ${data.toUserId}`);
        } else {
          console.warn(`   ⚠️ Target user ${data.toUserId} not found or not connected`);
        }
      } else {
        // Broadcast to all users in room except sender
        socket.broadcast.to(roomId).emit('signal', signalData);
        const room = rooms.get(roomId);
        const otherUsersCount = room ? room.size - 1 : 0;
        console.log(`   ✅ Signal broadcasted to ${otherUsersCount} users in room ${roomId}`);
      }
    } catch (error) {
      console.error(`❌ Error in signal handling:`, error);
    }
  });
  
  // Handle heartbeat for connection health
  socket.on('heartbeat-ping', (data) => {
    try {
      socket.emit('heartbeat-pong', { 
        timestamp: Date.now(),
        socketId: socket.id,
        received: data
      });
    } catch (error) {
      console.error(`❌ Error in heartbeat:`, error);
    }
  });
  
  // Handle room info requests
  socket.on('get-room-info', (roomId) => {
    try {
      const room = rooms.get(roomId);
      const roomInfo = {
        roomId,
        exists: !!room,
        users: room ? Array.from(room) : [],
        userCount: room ? room.size : 0,
        socketId: socket.id,
        userId: socket.userId
      };
      
      socket.emit('room-info', roomInfo);
      console.log(`\n📋 ROOM INFO REQUESTED`);
      console.log(`   Room: ${roomId}`);
      console.log(`   Users: ${roomInfo.userCount}`);
    } catch (error) {
      console.error(`❌ Error getting room info:`, error);
    }
  });
  
  // Handle user leaving room manually
  socket.on('leave-room', (roomId) => {
    handleUserLeaving(socket, roomId || socket.roomId);
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`\n🔌 USER DISCONNECTED`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   User ID: ${socket.userId || 'unknown'}`);
    console.log(`   Room ID: ${socket.roomId || 'unknown'}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    
    handleUserLeaving(socket, socket.roomId);
    
    console.log(`   Remaining connections: ${Math.max(0, io.engine.clientsCount - 1)}`);
    console.log(`   Active rooms: ${rooms.size}`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`\n💣 SOCKET ERROR`);
    console.error(`   Socket ID: ${socket.id}`);
    console.error(`   User ID: ${socket.userId || 'unknown'}`);
    console.error(`   Error: ${error.message || error}`);
    // Don't crash server for socket errors
  });
});

// Helper function to handle user leaving
function handleUserLeaving(socket, roomId) {
  try {
    const userId = socket.userId;
    
    if (userId && roomId) {
      // Remove user from room
      const room = rooms.get(roomId);
      if (room) {
        room.delete(userId);
        console.log(`   Removed ${userId} from room ${roomId}`);
        
        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(roomId);
          console.log(`   Deleted empty room ${roomId}`);
        } else {
          console.log(`   Room ${roomId} now has ${room.size} users: [${Array.from(room).join(', ')}]`);
        }
        
        // Notify others in the room
        socket.broadcast.to(roomId).emit('user-disconnected', userId);
        console.log(`   Notified room ${roomId} about ${userId} disconnection`);
      }
      
      // Clean up mappings
      userSocketMap.delete(userId);
      socketUserMap.delete(socket.id);
    }
  } catch (error) {
    console.error(`❌ Error in handleUserLeaving:`, error);
  }
}

// IMPROVED: Better error handling - don't crash server for WebSocket errors
server.on('error', (error) => {
  console.error('\n💥 SERVER ERROR:');
  console.error('   Message:', error.message);
  console.error('   Code:', error.code);
  // Don't shutdown for server errors unless critical
  if (error.code === 'EADDRINUSE') {
    console.error('   Port already in use - shutting down');
    process.exit(1);
  }
});

// IMPROVED: Handle uncaught exceptions more gracefully
process.on('uncaughtException', (error) => {
  console.error('\n💥 UNCAUGHT EXCEPTION:');
  console.error('   Message:', error.message);
  
  // Don't crash for WebSocket frame errors - they're often client-side issues
  if (error.message && (
    error.message.includes('Invalid WebSocket frame') || 
    error.message.includes('invalid UTF-8 sequence') ||
    error.message.includes('invalid status code')
  )) {
    console.error('   ⚠️ WebSocket frame error (non-critical) - continuing server operation');
    console.error('   This is usually caused by client disconnect or network issues');
    return; // Don't shutdown server
  }
  
  // For other critical errors, shutdown gracefully
  console.error('   Stack:', error.stack);
  console.error('   Shutting down gracefully...');
  
  server.close(() => {
    process.exit(1);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('   Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION:');
  console.error('   Promise:', promise);
  console.error('   Reason:', reason);
  // Don't crash for promise rejections - just log them
});

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`\n🔄 ${signal} received, shutting down gracefully...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close all socket connections
    io.close(() => {
      console.log('✅ Socket.IO server closed');
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    });
  });
  
  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Periodic cleanup of stale connections
setInterval(() => {
  try {
    const connectedSockets = io.sockets.sockets.size;
    
    console.log(`\n🔍 PERIODIC HEALTH CHECK`);
    console.log(`   Active connections: ${connectedSockets}`);
    console.log(`   Active rooms: ${rooms.size}`);
    console.log(`   User mappings: ${userSocketMap.size}`);
    
    // Clean up any inconsistent state
    for (const [roomId, users] of rooms.entries()) {
      const validUsers = new Set();
      for (const userId of users) {
        const socketId = userSocketMap.get(userId);
        if (socketId && io.sockets.sockets.has(socketId)) {
          validUsers.add(userId);
        } else {
          console.log(`   Cleaning up stale user: ${userId} from room: ${roomId}`);
          userSocketMap.delete(userId);
        }
      }
      
      if (validUsers.size === 0) {
        rooms.delete(roomId);
        console.log(`   Cleaned up empty room: ${roomId}`);
      } else if (validUsers.size !== users.size) {
        rooms.set(roomId, validUsers);
        console.log(`   Updated room ${roomId} users: ${validUsers.size}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in periodic cleanup:', error);
  }
}, 60000); // Run every minute

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 MEDICAL CONSULTATION SERVER STARTED`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   🌐 Port: ${PORT}`);
  console.log(`   🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ⏰ Started: ${new Date().toISOString()}`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   📋 Health Check: http://localhost:${PORT}/health`);
  console.log(`   🔌 Socket.IO: ws://localhost:${PORT}`);
  console.log(`   🎯 PeerJS: http://localhost:${PORT}/peerjs/myapp`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  console.log(`✅ Ready to handle video consultations!`);
});