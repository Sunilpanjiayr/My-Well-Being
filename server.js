const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');
const os = require('os');

const app = express();
const server = http.createServer(app);

// Get local network IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIP();
console.log(`🌐 Local IP Address: ${LOCAL_IP}`);

// Enhanced CORS configuration for cross-device access
const corsOptions = {
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    `http://${LOCAL_IP}:3000`,
    // Allow any local network IP for development
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:3000$/
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Add preflight handling for all routes
app.options('*', cors(corsOptions));

// Serve static files from public directory
app.use(express.static('public'));

// Enhanced health check endpoint with network info
app.get('/health', (req, res) => {
  const roomsInfo = Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    users: Array.from(users),
    userCount: users.size
  }));

  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    network: {
      localIP: LOCAL_IP,
      hostname: os.hostname(),
      platform: os.platform()
    },
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
    },
    cors: {
      allowedOrigins: corsOptions.origin
    }
  });
});

// Network info endpoint
app.get('/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const networkInfo = {};
  
  for (const [name, addrs] of Object.entries(interfaces)) {
    networkInfo[name] = addrs
      .filter(addr => addr.family === 'IPv4')
      .map(addr => ({
        address: addr.address,
        internal: addr.internal,
        netmask: addr.netmask
      }));
  }
  
  res.json({
    primaryIP: LOCAL_IP,
    allInterfaces: networkInfo,
    accessUrls: [
      `http://localhost:3001`,
      `http://127.0.0.1:3001`,
      `http://${LOCAL_IP}:3001`
    ]
  });
});

// Configure Socket.IO with enhanced settings for cross-device
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB for better reliability
  httpCompression: false,
  wsCompression: false
});

// Enhanced PeerJS server configuration
const peerServer = ExpressPeerServer(server, {
  debug: false,
  path: '/myapp',
  port: 3001,
  allow_discovery: true,
  proxied: false,
  // Enhanced configuration for better cross-device support
  generateClientId: () => {
    return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
  },
  // Add CORS headers for PeerJS
  corsOptions: corsOptions
});

// Mount PeerJS server
app.use('/peerjs', peerServer);

// Store active rooms and their participants
const rooms = new Map();
const userSocketMap = new Map();
const socketUserMap = new Map();
const connectionTimestamps = new Map(); // Track connection times

// Root endpoint with more detailed info
app.get('/', (req, res) => {
  res.json({
    message: 'Medical Consultation WebRTC Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    network: {
      localIP: LOCAL_IP,
      accessUrls: [
        `http://localhost:3001`,
        `http://${LOCAL_IP}:3001`
      ]
    },
    endpoints: {
      health: '/health',
      networkInfo: '/network-info',
      peerjs: '/peerjs/myapp'
    },
    usage: {
      clientUrl: `Replace localhost with ${LOCAL_IP} for cross-device access`,
      example: `const socket = io('http://${LOCAL_IP}:3001');`
    }
  });
});

// Enhanced PeerJS server events
peerServer.on('connection', (client) => {
  const timestamp = new Date().toISOString();
  connectionTimestamps.set(client.getId(), timestamp);
  
  console.log(`\n🔗 PEER CONNECTION`);
  console.log(`   Peer ID: ${client.getId()}`);
  console.log(`   Time: ${timestamp}`);
  console.log(`   Total peers: ${peerServer._clients.size || 'unknown'}`);
});

peerServer.on('disconnect', (client) => {
  const connectTime = connectionTimestamps.get(client.getId());
  const duration = connectTime ? 
    ((Date.now() - new Date(connectTime)) / 1000).toFixed(1) + 's' : 
    'unknown';
    
  console.log(`\n🔗 PEER DISCONNECTION`);
  console.log(`   Peer ID: ${client.getId()}`);
  console.log(`   Duration: ${duration}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  
  connectionTimestamps.delete(client.getId());
});

// Enhanced error handling for PeerJS
peerServer.on('error', (error) => {
  console.error(`\n💥 PEER SERVER ERROR:`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Code: ${error.code}`);
  console.error(`   Stack: ${error.stack}`);
});

// Enhanced Socket.IO connection handling
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'];
  
  console.log(`\n🔌 NEW SOCKET CONNECTION`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Client IP: ${clientIP}`);
  console.log(`   User Agent: ${userAgent ? userAgent.substring(0, 50) + '...' : 'unknown'}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Total connections: ${io.engine.clientsCount}`);
  
  // Enhanced room joining with better validation
  socket.on('join-room', (roomId, userId) => {
    console.log(`\n👤 USER JOINING ROOM`);
    console.log(`   Room ID: ${roomId}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   Client IP: ${clientIP}`);
    
    // Enhanced validation
    if (!roomId || typeof roomId !== 'string' || roomId.length < 3) {
      console.error(`   ❌ Invalid room ID: ${roomId}`);
      socket.emit('error', { message: 'Invalid room ID - must be at least 3 characters' });
      return;
    }
    
    if (!userId || typeof userId !== 'string' || userId.length < 3) {
      console.error(`   ❌ Invalid user ID: ${userId}`);
      socket.emit('error', { message: 'Invalid user ID - must be at least 3 characters' });
      return;
    }
    
    try {
      // Leave any previous rooms with proper cleanup
      const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      previousRooms.forEach(room => {
        console.log(`   Leaving previous room: ${room}`);
        socket.leave(room);
        
        if (rooms.has(room)) {
          const prevRoom = rooms.get(room);
          if (socket.userId) {
            prevRoom.delete(socket.userId);
            console.log(`   Removed ${socket.userId} from previous room ${room}`);
          }
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
      
      // Clean up any existing mappings for this user
      if (userSocketMap.has(userId)) {
        const oldSocketId = userSocketMap.get(userId);
        socketUserMap.delete(oldSocketId);
        console.log(`   Cleaned up old mapping for user ${userId}`);
      }
      
      // Store user mappings
      userSocketMap.set(userId, socket.id);
      socketUserMap.set(socket.id, userId);
      socket.userId = userId;
      socket.roomId = roomId;
      socket.joinTime = new Date().toISOString();
      
      // Add user to room
      room.add(userId);
      
      console.log(`   Room ${roomId} now has ${room.size} users: [${Array.from(room).join(', ')}]`);
      
      // Get other users in the room
      const otherUsers = Array.from(room).filter(id => id !== userId);
      
      // Notify others in the room about the new user
      const notificationData = {
        userId,
        joinTime: socket.joinTime,
        roomSize: room.size
      };
      
      socket.broadcast.to(roomId).emit('user-connected', userId, notificationData);
      console.log(`   Broadcasted 'user-connected' for ${userId} to ${otherUsers.length} other users`);
      
      // Send enhanced confirmation to the joining user
      socket.emit('room-joined', {
        roomId,
        userId,
        roomSize: room.size,
        otherUsers: otherUsers,
        success: true,
        serverInfo: {
          serverIP: LOCAL_IP,
          timestamp: socket.joinTime
        }
      });
      
      console.log(`✅ User ${userId} successfully joined room ${roomId}`);
      
    } catch (error) {
      console.error(`❌ Error in join-room:`, error);
      socket.emit('error', { 
        message: 'Failed to join room', 
        details: error.message,
        roomId,
        userId 
      });
    }
  });
  
  // Enhanced signaling with better error handling and logging
  socket.on('signal', (data) => {
    try {
      console.log(`\n📡 SIGNAL RECEIVED`);
      console.log(`   From: ${data.fromUserId || socket.userId || 'unknown'}`);
      console.log(`   To: ${data.toUserId || 'broadcast'}`);
      console.log(`   Type: ${data.type || 'webrtc-signal'}`);
      console.log(`   Room: ${data.roomId || socket.roomId}`);
      console.log(`   Data size: ${JSON.stringify(data).length} bytes`);
      
      const roomId = data.roomId || socket.roomId;
      const fromUserId = data.fromUserId || socket.userId;
      
      if (!roomId) {
        console.warn(`   ⚠️ No room ID provided for signal`);
        socket.emit('error', { message: 'No room ID for signal' });
        return;
      }
      
      if (!fromUserId) {
        console.warn(`   ⚠️ No sender user ID provided for signal`);
        socket.emit('error', { message: 'No sender user ID for signal' });
        return;
      }
      
      // Validate room exists
      const room = rooms.get(roomId);
      if (!room) {
        console.warn(`   ⚠️ Room ${roomId} does not exist`);
        socket.emit('error', { message: `Room ${roomId} does not exist` });
        return;
      }
      
      if (!room.has(fromUserId)) {
        console.warn(`   ⚠️ User ${fromUserId} not in room ${roomId}`);
        socket.emit('error', { message: 'User not in room' });
        return;
      }
      
      // Prepare enhanced signal data
      const signalData = {
        ...data,
        fromUserId: fromUserId,
        timestamp: Date.now(),
        serverIP: LOCAL_IP
      };
      
      // Forward the signal
      if (data.toUserId) {
        // Send to specific user
        const targetSocketId = userSocketMap.get(data.toUserId);
        if (targetSocketId && io.sockets.sockets.has(targetSocketId)) {
          io.to(targetSocketId).emit('signal', signalData);
          console.log(`   ✅ Signal forwarded to specific user ${data.toUserId}`);
        } else {
          console.warn(`   ⚠️ Target user ${data.toUserId} not found or not connected`);
          socket.emit('error', { 
            message: `Target user ${data.toUserId} not available`,
            targetUserId: data.toUserId
          });
        }
      } else {
        // Broadcast to all users in room except sender
        socket.broadcast.to(roomId).emit('signal', signalData);
        const otherUsersCount = room.size - 1;
        console.log(`   ✅ Signal broadcasted to ${otherUsersCount} users in room ${roomId}`);
      }
    } catch (error) {
      console.error(`❌ Error in signal handling:`, error);
      socket.emit('error', { 
        message: 'Signal processing failed',
        details: error.message
      });
    }
  });
  
  // Enhanced heartbeat with network diagnostics
  socket.on('heartbeat-ping', (data) => {
    try {
      const responseData = { 
        timestamp: Date.now(),
        socketId: socket.id,
        userId: socket.userId,
        roomId: socket.roomId,
        serverIP: LOCAL_IP,
        received: data,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
      };
      
      socket.emit('heartbeat-pong', responseData);
    } catch (error) {
      console.error(`❌ Error in heartbeat:`, error);
    }
  });
  
  // Enhanced room info with detailed diagnostics
  socket.on('get-room-info', (roomId) => {
    try {
      const room = rooms.get(roomId);
      const allUsers = room ? Array.from(room) : [];
      const connectedUsers = allUsers.filter(userId => {
        const socketId = userSocketMap.get(userId);
        return socketId && io.sockets.sockets.has(socketId);
      });
      
      const roomInfo = {
        roomId,
        exists: !!room,
        users: allUsers,
        connectedUsers: connectedUsers,
        userCount: allUsers.length,
        connectedCount: connectedUsers.length,
        socketId: socket.id,
        userId: socket.userId,
        serverInfo: {
          ip: LOCAL_IP,
          uptime: process.uptime(),
          totalConnections: io.engine.clientsCount,
          totalRooms: rooms.size
        }
      };
      
      socket.emit('room-info', roomInfo);
      console.log(`\n📋 ROOM INFO REQUESTED`);
      console.log(`   Room: ${roomId}`);
      console.log(`   Total users: ${allUsers.length}`);
      console.log(`   Connected users: ${connectedUsers.length}`);
    } catch (error) {
      console.error(`❌ Error getting room info:`, error);
      socket.emit('error', { message: 'Failed to get room info' });
    }
  });
  
  // Test connectivity endpoint for debugging
  socket.on('test-connectivity', (data) => {
    try {
      console.log(`\n🧪 CONNECTIVITY TEST`);
      console.log(`   From: ${socket.userId || socket.id}`);
      console.log(`   Data: ${JSON.stringify(data)}`);
      
      const response = {
        success: true,
        timestamp: Date.now(),
        echo: data,
        serverIP: LOCAL_IP,
        clientIP: socket.handshake.address,
        transport: socket.conn.transport.name,
        protocol: socket.conn.protocol
      };
      
      socket.emit('connectivity-result', response);
      console.log(`   ✅ Connectivity test successful`);
    } catch (error) {
      console.error(`❌ Connectivity test failed:`, error);
      socket.emit('connectivity-result', {
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
    }
  });
  
  // Handle user leaving room manually
  socket.on('leave-room', (roomId) => {
    console.log(`\n👋 USER MANUALLY LEAVING ROOM`);
    console.log(`   User: ${socket.userId}`);
    console.log(`   Room: ${roomId || socket.roomId}`);
    handleUserLeaving(socket, roomId || socket.roomId);
  });
  
  // Enhanced disconnection handling
  socket.on('disconnect', (reason) => {
    const duration = socket.joinTime ? 
      ((Date.now() - new Date(socket.joinTime)) / 1000).toFixed(1) + 's' : 
      'unknown';
      
    console.log(`\n🔌 USER DISCONNECTED`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   User ID: ${socket.userId || 'unknown'}`);
    console.log(`   Room ID: ${socket.roomId || 'unknown'}`);
    console.log(`   Duration: ${duration}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Client IP: ${socket.handshake.address}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    
    handleUserLeaving(socket, socket.roomId);
    
    console.log(`   Remaining connections: ${Math.max(0, io.engine.clientsCount - 1)}`);
    console.log(`   Active rooms: ${rooms.size}`);
  });
  
  // Enhanced error handling
  socket.on('error', (error) => {
    console.error(`\n💣 SOCKET ERROR`);
    console.error(`   Socket ID: ${socket.id}`);
    console.error(`   User ID: ${socket.userId || 'unknown'}`);
    console.error(`   Room ID: ${socket.roomId || 'unknown'}`);
    console.error(`   Error: ${error.message || error}`);
    console.error(`   Stack: ${error.stack || 'No stack trace'}`);
  });
});

// Enhanced helper function for user leaving
function handleUserLeaving(socket, roomId) {
  try {
    const userId = socket.userId;
    
    console.log(`\n🧹 CLEANING UP USER`);
    console.log(`   User ID: ${userId || 'unknown'}`);
    console.log(`   Room ID: ${roomId || 'unknown'}`);
    console.log(`   Socket ID: ${socket.id}`);
    
    if (userId && roomId) {
      // Remove user from room
      const room = rooms.get(roomId);
      if (room) {
        const hadUser = room.has(userId);
        room.delete(userId);
        
        if (hadUser) {
          console.log(`   ✅ Removed ${userId} from room ${roomId}`);
          
          // Notify others in the room with enhanced data
          const leaveData = {
            userId,
            timestamp: Date.now(),
            roomSize: room.size
          };
          
          socket.broadcast.to(roomId).emit('user-disconnected', userId, leaveData);
          console.log(`   📢 Notified room ${roomId} about ${userId} disconnection`);
        }
        
        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(roomId);
          console.log(`   🗑️ Deleted empty room ${roomId}`);
        } else {
          console.log(`   📊 Room ${roomId} now has ${room.size} users: [${Array.from(room).join(', ')}]`);
        }
      }
      
      // Clean up mappings
      userSocketMap.delete(userId);
      console.log(`   🧹 Cleaned user mapping for ${userId}`);
    }
    
    socketUserMap.delete(socket.id);
    console.log(`   🧹 Cleaned socket mapping for ${socket.id}`);
    
  } catch (error) {
    console.error(`❌ Error in handleUserLeaving:`, error);
  }
}

// Enhanced error handling - don't crash server
server.on('error', (error) => {
  console.error('\n💥 SERVER ERROR:');
  console.error('   Message:', error.message);
  console.error('   Code:', error.code);
  console.error('   Stack:', error.stack);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`   ❌ Port ${PORT} already in use`);
    console.error('   💡 Try killing the process: lsof -ti:3001 | xargs kill -9');
    process.exit(1);
  } else if (error.code === 'EACCES') {
    console.error('   ❌ Permission denied - try running with sudo or use port > 1024');
    process.exit(1);
  }
});

// Enhanced uncaught exception handling
process.on('uncaughtException', (error) => {
  console.error('\n💥 UNCAUGHT EXCEPTION:');
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
  
  // Don't crash for WebSocket frame errors - they're often client-side issues
  if (error.message && (
    error.message.includes('Invalid WebSocket frame') || 
    error.message.includes('invalid UTF-8 sequence') ||
    error.message.includes('invalid status code') ||
    error.message.includes('WebSocket connection closed') ||
    error.message.includes('socket hang up')
  )) {
    console.error('   ⚠️ WebSocket/Network error (non-critical) - continuing server operation');
    console.error('   💡 This is usually caused by client disconnect or network issues');
    return; // Don't shutdown server
  }
  
  // For other critical errors, shutdown gracefully
  console.error('   🚨 Critical error detected - shutting down gracefully...');
  
  server.close(() => {
    console.error('   ✅ Server closed gracefully');
    process.exit(1);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('   ⏰ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION:');
  console.error('   Promise:', promise);
  console.error('   Reason:', reason);
  console.error('   Stack:', reason.stack || 'No stack trace');
  // Don't crash for promise rejections - just log them
});

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`\n🔄 ${signal} received, shutting down gracefully...`);
  
  // Notify all connected clients
  io.emit('server-shutdown', { 
    message: 'Server is shutting down',
    timestamp: Date.now()
  });
  
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

// Enhanced periodic cleanup with better diagnostics
setInterval(() => {
  try {
    const connectedSockets = io.sockets.sockets.size;
    const totalRooms = rooms.size;
    const totalUserMappings = userSocketMap.size;
    
    console.log(`\n🔍 PERIODIC HEALTH CHECK`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   🔌 Active connections: ${connectedSockets}`);
    console.log(`   🏠 Active rooms: ${totalRooms}`);
    console.log(`   👥 User mappings: ${totalUserMappings}`);
    console.log(`   💾 Memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ⏰ Uptime: ${(process.uptime() / 3600).toFixed(2)} hours`);
    
    // Clean up any inconsistent state
    let cleanedUsers = 0;
    let cleanedRooms = 0;
    
    for (const [roomId, users] of rooms.entries()) {
      const validUsers = new Set();
      
      for (const userId of users) {
        const socketId = userSocketMap.get(userId);
        if (socketId && io.sockets.sockets.has(socketId)) {
          validUsers.add(userId);
        } else {
          console.log(`   🧹 Cleaning up stale user: ${userId} from room: ${roomId}`);
          userSocketMap.delete(userId);
          cleanedUsers++;
        }
      }
      
      if (validUsers.size === 0) {
        rooms.delete(roomId);
        console.log(`   🗑️ Cleaned up empty room: ${roomId}`);
        cleanedRooms++;
      } else if (validUsers.size !== users.size) {
        rooms.set(roomId, validUsers);
        console.log(`   📊 Updated room ${roomId}: ${users.size} → ${validUsers.size} users`);
      }
    }
    
    // Clean up orphaned socket mappings
    let cleanedSockets = 0;
    for (const [socketId, userId] of socketUserMap.entries()) {
      if (!io.sockets.sockets.has(socketId)) {
        socketUserMap.delete(socketId);
        userSocketMap.delete(userId);
        cleanedSockets++;
      }
    }
    
    if (cleanedUsers > 0 || cleanedRooms > 0 || cleanedSockets > 0) {
      console.log(`   🧹 Cleanup summary: ${cleanedUsers} users, ${cleanedRooms} rooms, ${cleanedSockets} sockets`);
    }
    
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
  } catch (error) {
    console.error('❌ Error in periodic cleanup:', error);
  }
}, 60000); // Run every minute

// Network diagnostic endpoint for debugging
app.get('/diagnose/:roomId?', (req, res) => {
  try {
    const { roomId } = req.params;
    const rooms_info = Array.from(rooms.entries()).map(([id, users]) => ({
      roomId: id,
      users: Array.from(users),
      userCount: users.size
    }));
    
    const specific_room = roomId && rooms.has(roomId) ? {
      roomId,
      users: Array.from(rooms.get(roomId)),
      userCount: rooms.get(roomId).size,
      userMappings: Array.from(rooms.get(roomId)).map(userId => ({
        userId,
        socketId: userSocketMap.get(userId),
        connected: userSocketMap.has(userId) && io.sockets.sockets.has(userSocketMap.get(userId))
      }))
    } : null;
    
    res.json({
      timestamp: new Date().toISOString(),
      server: {
        localIP: LOCAL_IP,
        port: PORT,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      },
      connections: {
        total: io.engine.clientsCount,
        details: Array.from(io.sockets.sockets.keys())
      },
      rooms: {
        total: rooms.size,
        all: rooms_info,
        requested: specific_room
      },
      mappings: {
        userToSocket: Object.fromEntries(userSocketMap),
        socketToUser: Object.fromEntries(socketUserMap)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 MEDICAL CONSULTATION SERVER STARTED`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   🌐 Port: ${PORT}`);
  console.log(`   🏠 Host: 0.0.0.0 (accessible from all network interfaces)`);
  console.log(`   🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ⏰ Started: ${new Date().toISOString()}`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   📱 LOCAL ACCESS:`);
  console.log(`   📋 Health Check: http://localhost:${PORT}/health`);
  console.log(`   🔌 Socket.IO: ws://localhost:${PORT}`);
  console.log(`   🎯 PeerJS: http://localhost:${PORT}/peerjs/myapp`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   🌍 NETWORK ACCESS (for other devices):`);
  console.log(`   📋 Health Check: http://${LOCAL_IP}:${PORT}/health`);
  console.log(`   🔌 Socket.IO: ws://${LOCAL_IP}:${PORT}`);
  console.log(`   🎯 PeerJS: http://${LOCAL_IP}:${PORT}/peerjs/myapp`);
  console.log(`   🔧 Network Info: http://${LOCAL_IP}:${PORT}/network-info`);
  console.log(`   🩺 Diagnostics: http://${LOCAL_IP}:${PORT}/diagnose`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   💡 SETUP INSTRUCTIONS:`);
  console.log(`   1. Find your computer's IP: ${LOCAL_IP}`);
  console.log(`   2. Update your React app to use: http://${LOCAL_IP}:3001`);
  console.log(`   3. Ensure both devices are on the same network`);
  console.log(`   4. Test connectivity: http://${LOCAL_IP}:${PORT}/health`);
  console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  console.log(`✅ Ready to handle cross-device video consultations!`);
  console.log(`🔍 Monitor this console for connection logs and diagnostics.\n`);
});