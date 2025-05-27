const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active rooms and their participants
const rooms = new Map();
const userSocketMap = new Map(); // Map userId to socketId

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    rooms: {
      total: rooms.size,
      active: Array.from(rooms.keys()),
      details: Array.from(rooms.entries()).map(([roomId, users]) => ({
        roomId,
        users: Array.from(users)
      }))
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WebRTC Signaling Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`\n🔌 NEW CONNECTION`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Total connections: ${io.engine.clientsCount}`);
  
  // Handle room joining
  socket.on('join-room', (roomId, userId) => {
    console.log(`\n👤 USER JOINING ROOM`);
    console.log(`   Room ID: ${roomId}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Socket ID: ${socket.id}`);
    
    // Leave any previous rooms
    const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    previousRooms.forEach(room => {
      socket.leave(room);
      console.log(`   Left previous room: ${room}`);
    });
    
    // Join the new room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      console.log(`   Created new room: ${roomId}`);
    }
    
    const room = rooms.get(roomId);
    
    // Store user mapping
    userSocketMap.set(userId, socket.id);
    socket.userId = userId;
    socket.roomId = roomId;
    
    // Add user to room
    room.add(userId);
    
    console.log(`   Room ${roomId} now has ${room.size} users: [${Array.from(room).join(', ')}]`);
    
    // Notify others in the room about the new user
    socket.broadcast.to(roomId).emit('user-connected', userId);
    console.log(`   Broadcasted 'user-connected' for ${userId} to room ${roomId}`);
    
    // Send confirmation to the joining user
    socket.emit('room-joined', {
      roomId,
      userId,
      roomSize: room.size,
      otherUsers: Array.from(room).filter(id => id !== userId)
    });
    
    console.log(`✅ User ${userId} successfully joined room ${roomId}`);
  });
  
  // Handle signaling (for WebRTC offer/answer/ice-candidates)
  socket.on('signal', (data) => {
    console.log(`\n📡 SIGNAL RECEIVED`);
    console.log(`   From: ${data.fromUserId || socket.userId}`);
    console.log(`   To: ${data.toUserId || 'broadcast'}`);
    console.log(`   Type: ${data.type || 'unknown'}`);
    console.log(`   Room: ${data.roomId || socket.roomId}`);
    
    const roomId = data.roomId || socket.roomId;
    
    if (!roomId) {
      console.warn(`   ⚠️ No room ID provided for signal`);
      return;
    }
    
    // Forward the signal to other users in the room
    if (data.toUserId) {
      // Send to specific user
      const targetSocketId = userSocketMap.get(data.toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('signal', {
          ...data,
          fromUserId: socket.userId
        });
        console.log(`   ✅ Signal forwarded to specific user ${data.toUserId}`);
      } else {
        console.warn(`   ⚠️ Target user ${data.toUserId} not found`);
      }
    } else {
      // Broadcast to all users in room except sender
      socket.broadcast.to(roomId).emit('signal', {
        ...data,
        fromUserId: socket.userId
      });
      console.log(`   ✅ Signal broadcasted to room ${roomId}`);
    }
  });
  
  // Handle heartbeat
  socket.on('heartbeat-ping', () => {
    socket.emit('heartbeat-pong', { 
      timestamp: Date.now(),
      socketId: socket.id 
    });
  });
  
  // Handle custom events
  socket.on('get-room-info', (roomId) => {
    const room = rooms.get(roomId);
    socket.emit('room-info', {
      roomId,
      users: room ? Array.from(room) : [],
      userCount: room ? room.size : 0
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`\n🔌 USER DISCONNECTED`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   User ID: ${socket.userId}`);
    console.log(`   Room ID: ${socket.roomId}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    
    const userId = socket.userId;
    const roomId = socket.roomId;
    
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
      
      // Remove from user mapping
      userSocketMap.delete(userId);
    }
    
    console.log(`   Remaining connections: ${io.engine.clientsCount - 1}`);
    console.log(`   Active rooms: ${rooms.size}`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`\n💣 SOCKET ERROR`);
    console.error(`   Socket ID: ${socket.id}`);
    console.error(`   User ID: ${socket.userId}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  });
});

// Global error handling
server.on('error', (error) => {
  console.error('\n💥 SERVER ERROR:');
  console.error('   Message:', error.message);
  console.error('   Code:', error.code);
  console.error('   Stack:', error.stack);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 UNCAUGHT EXCEPTION:');
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
  console.error('   Shutting down gracefully...');
  
  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION:');
  console.error('   Promise:', promise);
  console.error('   Reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n🚀 WEBRTC SIGNALING SERVER STARTED`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Health Check: http://localhost:${PORT}/health`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});