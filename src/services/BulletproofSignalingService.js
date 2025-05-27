import { io } from 'socket.io-client';
import { auth } from '../components/Auth/firebase';

class BulletproofSignalingService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.onSignalCallback = null;
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.maxAttempts = 3;
    this.heartbeatInterval = null;
  }

  async connect(roomId) {
    console.log(`\n🎯 CONNECTING TO SIGNALING SERVER`);
    console.log(`   Room: ${roomId}`);
    console.log(`   Attempt: ${this.connectionAttempts + 1}/${this.maxAttempts}`);

    // Prevent multiple simultaneous connections
    if (this.isConnecting) {
      console.log('⏳ Connection already in progress...');
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkInterval);
            if (this.socket?.connected) {
              resolve();
            } else {
              reject(new Error('Connection failed'));
            }
          }
        }, 100);
      });
    }

    // Already connected to same room
    if (this.socket?.connected && this.roomId === roomId) {
      console.log('✅ Already connected to this room');
      return Promise.resolve();
    }

    // Clean up existing connection
    await this.disconnect();

    this.isConnecting = true;
    this.roomId = roomId;

    return new Promise((resolve, reject) => {
      console.log('🚀 Creating socket connection...');

      // Check authentication
      if (!auth.currentUser?.uid) {
        this.isConnecting = false;
        reject(new Error('User not authenticated'));
        return;
      }

      const userId = auth.currentUser.uid;
      console.log(`👤 User ID: ${userId}`);

      // Try multiple server URLs in case of port issues
      const serverUrls = [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3002'
      ];

      let currentUrlIndex = 0;

      const tryConnect = () => {
        if (currentUrlIndex >= serverUrls.length) {
          this.isConnecting = false;
          reject(new Error('All connection attempts failed. Please ensure the signaling server is running.'));
          return;
        }

        const serverUrl = serverUrls[currentUrlIndex];
        console.log(`🔄 Trying server: ${serverUrl}`);

        this.socket = io(serverUrl, {
          transports: ['polling', 'websocket'], // Try polling first, then websocket
          timeout: 10000,
          forceNew: true,
          autoConnect: true,
          reconnection: false, // We handle reconnection manually
          upgrade: true, // Allow upgrading to websocket
          query: {
            roomId: roomId,
            userId: userId
          }
        });

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          console.log(`⏰ Connection timeout for ${serverUrl}`);
          this.socket?.disconnect();
          currentUrlIndex++;
          tryConnect();
        }, 10000);

        // Connection successful
        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          console.log(`✅ CONNECTED SUCCESSFULLY!`);
          console.log(`   Server: ${serverUrl}`);
          console.log(`   Socket ID: ${this.socket.id}`);
          console.log(`   Transport: ${this.socket.io.engine.transport.name}`);
          
          // CRITICAL: Explicitly join the room
          console.log('🚪 Joining room:', roomId);
          this.socket.emit('join-room', { 
            roomId: roomId, 
            userId: userId 
          });
          
          this.connectionAttempts = 0;
          this.isConnecting = false;
          
          // Start heartbeat to keep connection alive
          this.startHeartbeat();
          
          resolve();
        });

        // Connection failed
        this.socket.on('connect_error', (error) => {
          clearTimeout(connectionTimeout);
          console.log(`❌ Connection failed to ${serverUrl}: ${error.message}`);
          currentUrlIndex++;
          tryConnect();
        });

        // Server acknowledgment
        this.socket.on('connection_success', (data) => {
          console.log(`🎉 SERVER ACKNOWLEDGED CONNECTION`);
          console.log(`   Data:`, data);
        });

        // CRITICAL: Handle room join confirmation
        this.socket.on('room-joined', (data) => {
          console.log(`🏠 SUCCESSFULLY JOINED ROOM`);
          console.log(`   Room: ${data.roomId}`);
          console.log(`   Users in room: ${data.userCount}`);
          console.log(`   Other users:`, data.otherUsers);
        });

        // Handle incoming signals - IMPROVED LOGGING
        this.socket.on('signal', (data) => {
          console.log(`📥 RAW SIGNAL RECEIVED:`, {
            type: data.type,
            fromUserId: data.fromUserId,
            toUserId: data.toUserId,
            roomId: data.roomId,
            timestamp: data.timestamp,
            hasOffer: !!data.offer,
            hasAnswer: !!data.answer,
            hasCandidate: !!data.candidate
          });

          // Don't process our own signals
          if (data.fromUserId === userId) {
            console.log('🔄 Ignoring own signal');
            return;
          }

          console.log(`📨 PROCESSING SIGNAL: ${data.type || 'ice-candidate'}`);
          
          if (this.onSignalCallback) {
            try {
              this.onSignalCallback(data);
              console.log('✅ Signal processed by callback');
            } catch (error) {
              console.error('❌ Error in signal callback:', error);
            }
          } else {
            console.warn('⚠️ No signal callback registered!');
          }
        });

        // Handle user events
        this.socket.on('user-joined', (data) => {
          console.log(`👋 USER JOINED ROOM: ${data.userId}`);
          console.log(`   Total users now: ${data.userCount}`);
        });

        this.socket.on('user-left', (data) => {
          console.log(`👋 USER LEFT ROOM: ${data.userId}`);
          console.log(`   Total users now: ${data.userCount}`);
        });

        // Handle transport upgrade
        this.socket.on('upgrade', () => {
          console.log(`⬆️ Transport upgraded to: ${this.socket.io.engine.transport.name}`);
        });

        // Handle disconnection
        this.socket.on('disconnect', (reason) => {
          console.log(`🔌 DISCONNECTED: ${reason}`);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Auto-reconnect for certain reasons
          if (reason === 'io server disconnect') {
            console.log('🔄 Server disconnected us, will not auto-reconnect');
          } else {
            console.log('🔄 Connection lost, may need manual reconnection');
          }
        });

        // Handle errors
        this.socket.on('error', (error) => {
          console.error(`❗ SOCKET ERROR:`, error);
        });

        // Handle connection issues
        this.socket.on('connect_timeout', () => {
          console.error(`⏰ CONNECTION TIMEOUT`);
        });

        this.socket.on('reconnect_error', (error) => {
          console.error(`🔄 RECONNECTION ERROR:`, error);
        });
      };

      tryConnect();
    });
  }

  startHeartbeat() {
    // Send ping every 25 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log('💓 Sending heartbeat ping');
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 25000);

    // Listen for pong
    this.socket?.on('pong', (data) => {
      console.log('💓 Received heartbeat pong:', data);
    });
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  sendSignal(data) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot send signal: not connected');
      console.warn('   Socket exists:', !!this.socket);
      console.warn('   Socket connected:', this.socket?.connected);
      return false;
    }

    try {
      const signalData = {
        ...data,
        roomId: this.roomId,
        fromUserId: auth.currentUser?.uid,
        timestamp: Date.now()
      };

      console.log(`📤 SENDING SIGNAL:`, {
        type: data.type || 'ice-candidate',
        roomId: this.roomId,
        fromUserId: signalData.fromUserId,
        hasOffer: !!data.offer,
        hasAnswer: !!data.answer,
        hasCandidate: !!data.candidate,
        socketConnected: this.socket.connected,
        socketId: this.socket.id
      });

      // Send the signal
      this.socket.emit('signal', signalData);
      
      console.log(`✅ Signal emitted successfully`);
      return true;
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      return false;
    }
  }

  onSignal(callback) {
    if (typeof callback !== 'function') {
      console.error('❌ Signal callback must be a function');
      return;
    }
    this.onSignalCallback = callback;
    console.log('✅ Signal callback registered');
  }

  async disconnect() {
    console.log('🔌 DISCONNECTING from signaling service...');
    
    // Stop heartbeat
    this.stopHeartbeat();
    
    // Prevent multiple disconnect calls
    if (!this.socket) {
      console.log('✅ Already disconnected');
      return;
    }
    
    this.isConnecting = false;

    const socketToDisconnect = this.socket;
    this.socket = null;

    try {
      // Leave room before disconnecting
      if (socketToDisconnect.connected && this.roomId) {
        console.log('🚪 Leaving room:', this.roomId);
        socketToDisconnect.emit('leave-room', { 
          roomId: this.roomId, 
          userId: auth.currentUser?.uid 
        });
      }
      
      if (socketToDisconnect.connected) {
        socketToDisconnect.disconnect();
      }
      socketToDisconnect.removeAllListeners();
    } catch (error) {
      console.warn('⚠️ Error during disconnect:', error);
    }

    this.roomId = null;
    this.onSignalCallback = null;
    console.log('✅ Disconnect complete');
  }

  // Test connection to server
  async testConnection() {
    console.log('🧪 TESTING CONNECTION...');
    
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      console.log('✅ Server health check passed:', data);
      return true;
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return false;
    }
  }

  // Utility methods
  isConnected() {
    return this.socket?.connected || false;
  }

  getCurrentRoom() {
    return this.roomId;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    if (this.isConnecting) return 'connecting';
    return this.socket.connected ? 'connected' : 'disconnected';
  }

  // Debug method to check socket status
  getDebugInfo() {
    return {
      hasSocket: !!this.socket,
      isConnected: this.socket?.connected,
      socketId: this.socket?.id,
      roomId: this.roomId,
      transport: this.socket?.io?.engine?.transport?.name,
      isConnecting: this.isConnecting,
      hasCallback: !!this.onSignalCallback
    };
  }
}

export default new BulletproofSignalingService();