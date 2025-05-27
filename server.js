const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount
  });
});

// Store room information
const rooms = new Map();

// Helper function to get room info
function getRoomInfo(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      createdAt: new Date()
    });
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  console.log(`\n🔌 NEW CONNECTION`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Transport: ${socket.conn.transport.name}`);
  console.log(`   Query params:`, socket.handshake.query);
  
  const { roomId, userId } = socket.handshake.query;
  
  if (!roomId || !userId) {
    console.log('❌ Missing roomId or userId in connection');
    socket.emit('error', { message: 'Missing roomId or userId' });
    socket.disconnect();
    return;
  }

  console.log(`   Room: ${roomId}`);
  console.log(`   User: ${userId}`);

  // Store user info with socket
  socket.roomId = roomId;
  socket.userId = userId;

  // Handle room joining
  socket.on('join-room', (data) => {
    console.log(`\n🏠 JOIN ROOM REQUEST`);
    console.log(`   Socket: ${socket.id}`);
    console.log(`   Room: ${data.roomId}`);
    console.log(`   User: ${data.userId}`);

    const room = getRoomInfo(data.roomId);
    
    // Add user to room
    room.users.set(data.userId, {
      socketId: socket.id,
      joinedAt: new Date(),
      socket: socket
    });

    // Join socket.io room
    socket.join(data.roomId);

    console.log(`✅ USER JOINED ROOM`);
    console.log(`   Users in room: ${room.users.size}`);
    console.log(`   User list:`, Array.from(room.users.keys()));

    // Notify user they joined successfully
    socket.emit('room-joined', {
      roomId: data.roomId,
      userCount: room.users.size,
      otherUsers: Array.from(room.users.keys()).filter(id => id !== data.userId)
    });

    // Notify other users in room
    socket.to(data.roomId).emit('user-joined', {
      userId: data.userId,
      userCount: room.users.size
    });
  });

  // Handle signals (offers, answers, ICE candidates)
  socket.on('signal', (data) => {
    console.log(`\n📨 SIGNAL RECEIVED`);
    console.log(`   From: ${data.fromUserId} (${socket.id})`);
    console.log(`   Room: ${data.roomId}`);
    console.log(`   Type: ${data.type || 'ice-candidate'}`);
    console.log(`   Timestamp: ${data.timestamp}`);

    if (!data.roomId) {
      console.log('❌ No roomId in signal');
      return;
    }

    const room = getRoomInfo(data.roomId);
    console.log(`   Room has ${room.users.size} users`);

    // Relay signal to ALL other users in the room
    let relayCount = 0;
    room.users.forEach((userInfo, userId) => {
      if (userId !== data.fromUserId) {
        console.log(`   📤 Relaying to: ${userId} (${userInfo.socketId})`);
        
        try {
          userInfo.socket.emit('signal', {
            ...data,
            relayedAt: new Date().toISOString()
          });
          relayCount++;
        } catch (error) {
          console.error(`   ❌ Failed to relay to ${userId}:`, error.message);
        }
      }
    });

    console.log(`✅ Signal relayed to ${relayCount} users`);

    // Alternative: Use socket.io rooms (this should also work)
    socket.to(data.roomId).emit('signal', {
      ...data,
      relayedAt: new Date().toISOString()
    });
  });

  // Handle leaving room
  socket.on('leave-room', (data) => {
    console.log(`\n🚪 LEAVE ROOM REQUEST`);
    console.log(`   Socket: ${socket.id}`);
    console.log(`   Room: ${data.roomId}`);
    console.log(`   User: ${data.userId}`);

    handleUserLeave(socket, data.roomId, data.userId);
  });

  // Handle ping for heartbeat
  socket.on('ping', (data) => {
    console.log(`💓 Ping from ${socket.userId}: ${data.timestamp}`);
    socket.emit('pong', { 
      timestamp: data.timestamp, 
      serverTime: Date.now() 
    });
  });

  // Handle transport upgrade
  socket.conn.on('upgrade', () => {
    console.log(`⬆️ Transport upgraded to ${socket.conn.transport.name} for ${socket.id}`);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`\n🔌 DISCONNECTION`);
    console.log(`   Socket: ${socket.id}`);
    console.log(`   User: ${socket.userId}`);
    console.log(`   Room: ${socket.roomId}`);
    console.log(`   Reason: ${reason}`);

    handleUserLeave(socket, socket.roomId, socket.userId);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❗ Socket error for ${socket.id}:`, error);
  });

  // Send connection success
  socket.emit('connection_success', {
    message: 'Connected successfully to signaling server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

// Helper function to handle user leaving
function handleUserLeave(socket, roomId, userId) {
  if (!roomId || !userId) return;

  const room = getRoomInfo(roomId);
  
  if (room.users.has(userId)) {
    room.users.delete(userId);
    console.log(`✅ User ${userId} removed from room ${roomId}`);
    console.log(`   Remaining users: ${room.users.size}`);
    
    // Leave socket.io room
    socket.leave(roomId);
    
    // Notify other users
    socket.to(roomId).emit('user-left', {
      userId: userId,
      userCount: room.users.size
    });
    
    // Clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ Removed empty room: ${roomId}`);
    }
  }
}

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n🚀 SIGNALING SERVER RUNNING`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

// Periodic room cleanup
setInterval(() => {
  const now = new Date();
  let cleanedRooms = 0;
  
  rooms.forEach((room, roomId) => {
    // Remove rooms older than 24 hours with no users
    if (room.users.size === 0 && (now - room.createdAt) > 24 * 60 * 60 * 1000) {
      rooms.delete(roomId);
      cleanedRooms++;
    }
  });
  
  if (cleanedRooms > 0) {
    console.log(`🗑️ Cleaned up ${cleanedRooms} old empty rooms`);
  }
}, 60 * 60 * 1000); // Run every hour