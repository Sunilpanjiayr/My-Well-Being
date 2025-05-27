import { io } from 'socket.io-client';
import { auth } from '../components/Auth/firebase';

class SimplifiedSignalingService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.isConnected = false;
    this.serverUrl = 'http://localhost:3001';
    this.callbacks = {
      onUserConnected: null,
      onUserDisconnected: null,
      onSignal: null,
      onError: null
    };
  }

  async connect(roomId) {
    console.log(`🎯 Connecting to signaling server for room: ${roomId}`);

    if (this.socket?.connected && this.roomId === roomId) {
      console.log('✅ Already connected to this room');
      return Promise.resolve();
    }

    // Clean up existing connection
    await this.disconnect();

    return new Promise((resolve, reject) => {
      if (!auth.currentUser?.uid) {
        reject(new Error('User not authenticated'));
        return;
      }

      const userId = auth.currentUser.uid;
      console.log(`👤 Connecting as user: ${userId}`);

      // Create new socket connection
      this.socket = io(this.serverUrl, {
        transports: ['polling', 'websocket'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000
      });

      const connectionTimeout = setTimeout(() => {
        console.error('❌ Connection timeout');
        this.socket?.disconnect();
        reject(new Error('Connection timeout'));
      }, 30000);

      // Connection successful
      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Socket connected:', this.socket.id);
        this.isConnected = true;
        this.roomId = roomId;
        
        // Join the room
        this.socket.emit('join-room', roomId, userId);
        resolve();
      });

      // Connection failed
      this.socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ Connection failed:', error.message);
        this.isConnected = false;
        reject(new Error(`Connection failed: ${error.message}`));
      });

      // Room joined successfully
      this.socket.on('room-joined', (data) => {
        console.log('🏠 Successfully joined room:', data);
      });

      // User connected to room
      this.socket.on('user-connected', (userId) => {
        console.log('👤 User connected:', userId);
        if (this.callbacks.onUserConnected) {
          this.callbacks.onUserConnected(userId);
        }
      });

      // User disconnected from room
      this.socket.on('user-disconnected', (userId) => {
        console.log('👤 User disconnected:', userId);
        if (this.callbacks.onUserDisconnected) {
          this.callbacks.onUserDisconnected(userId);
        }
      });

      // Signal received
      this.socket.on('signal', (data) => {
        console.log('📡 Signal received:', data.type || 'unknown');
        if (this.callbacks.onSignal) {
          this.callbacks.onSignal(data);
        }
      });

      // Handle disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          console.log('🔄 Server disconnected, attempting to reconnect...');
        }
      });

      // Handle errors
      this.socket.on('error', (error) => {
        console.error('💣 Socket error:', error);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      });
    });
  }

  async disconnect() {
    console.log('🔌 Disconnecting from signaling server...');
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.roomId = null;
    console.log('✅ Disconnected successfully');
  }

  sendSignal(data) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot send signal: not connected');
      return false;
    }

    if (!this.roomId) {
      console.warn('⚠️ Cannot send signal: no room ID');
      return false;
    }

    try {
      const signalData = {
        ...data,
        roomId: this.roomId,
        fromUserId: auth.currentUser?.uid,
        timestamp: Date.now()
      };

      console.log('📤 Sending signal:', {
        type: data.type || 'unknown',
        roomId: this.roomId,
        hasOffer: !!data.offer,
        hasAnswer: !!data.answer,
        hasCandidate: !!data.candidate
      });

      this.socket.emit('signal', signalData);
      return true;
    } catch (error) {
      console.error('❌ Error sending signal:', error);
      return false;
    }
  }

  // Set callbacks
  onUserConnected(callback) {
    this.callbacks.onUserConnected = callback;
  }

  onUserDisconnected(callback) {
    this.callbacks.onUserDisconnected = callback;
  }

  onSignal(callback) {
    this.callbacks.onSignal = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  // Utility methods
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'disconnected';
  }

  getCurrentRoom() {
    return this.roomId;
  }

  getDebugInfo() {
    return {
      hasSocket: !!this.socket,
      isConnected: this.socket?.connected,
      socketId: this.socket?.id,
      roomId: this.roomId,
      transport: this.socket?.io?.engine?.transport?.name,
      serverUrl: this.serverUrl
    };
  }
}

// Export singleton instance
export default new SimplifiedSignalingService();