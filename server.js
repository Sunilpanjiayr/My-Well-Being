const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS - More permissive for development
app.use(cors({
  origin: "*",  // In production, replace with specific origins
  methods: ["GET", "POST"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: "*",  // In production, replace with specific origins
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,  // Increased ping timeout
  pingInterval: 25000  // Increased ping interval
});

// Store active rooms and their participants
const rooms = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    rooms: {
      total: rooms.size,
      active: Array.from(rooms.keys())
    }
  });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);
  
  let currentRoom = null;
  
  // Join room handler
  socket.on('join-room', async (data) => {
    try {
      const { roomId, userId } = data;
      
      if (!roomId || !userId) {
        throw new Error('Missing roomId or userId');
      }
      
      // Leave current room if any
      if (currentRoom) {
        await socket.leave(currentRoom);
        const room = rooms.get(currentRoom);
        if (room) {
          room.delete(userId);
          if (room.size === 0) {
            rooms.delete(currentRoom);
          }
        }
      }
      
      // Join new room
      await socket.join(roomId);
      currentRoom = roomId;
      
      // Initialize room if doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(userId);
      
      // Get other users in room
      const otherUsers = Array.from(rooms.get(roomId)).filter(id => id !== userId);
      
      // Notify user of successful join
      socket.emit('room-joined', {
        roomId,
        userCount: rooms.get(roomId).size,
        otherUsers
      });
      
      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        userId,
        userCount: rooms.get(roomId).size
      });
      
    } catch (error) {
      console.error('Room join error:', error);
      socket.emit('error', {
        type: 'room-join-error',
        message: error.message
      });
    }
  });
  
  // Signal relay handler
  socket.on('signal', (data) => {
    try {
      const { roomId, fromUserId, toUserId } = data;
      
      if (!roomId || !fromUserId) {
        throw new Error('Missing required signal data');
      }
      
      // Validate user is in room
      const room = rooms.get(roomId);
      if (!room || !room.has(fromUserId)) {
        throw new Error('User not in room');
      }
      
      console.log(`📡 Signal: ${data.type || 'ICE'} from ${fromUserId}`);
      
      // Relay signal to room or specific user
      if (toUserId) {
        socket.to(roomId).emit('signal', data);
      } else {
        socket.to(roomId).emit('signal', data);
      }
      
    } catch (error) {
      console.error('Signal relay error:', error);
      socket.emit('error', {
        type: 'signal-error',
        message: error.message
      });
    }
  });
  
  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`🔌 Disconnection: ${socket.id}`);
    
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        // Find userId in room
        const userId = Array.from(room).find(id => {
          const sockets = io.sockets.adapter.rooms.get(currentRoom);
          return sockets && !sockets.has(socket.id);
        });
        
        if (userId) {
          room.delete(userId);
          if (room.size === 0) {
            rooms.delete(currentRoom);
          }
          
          // Notify others in room
          socket.to(currentRoom).emit('user-left', {
            userId,
            userCount: room.size
          });
        }
      }
    }
  });
  
  // Heartbeat handlers
  socket.on('heartbeat-ping', () => {
    socket.emit('heartbeat-pong', { timestamp: Date.now() });
  });
});

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