import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../Auth/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,  // Added for polling fallback
  serverTimestamp,
  updateDoc,
  doc 
} from 'firebase/firestore';

import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';//for file-attaching feature
import { onAuthStateChanged } from 'firebase/auth';

import Peer from 'peerjs';
import io from 'socket.io-client';
import './ConsultationRoom.css';

const ConsultationRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [videoSetupAttempted, setVideoSetupAttempted] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const callRef = useRef(null);
  const initialized = useRef(false);
  const cleanupFunctions = useRef([]);
  const fileInputRef = useRef(null);
  

  console.log('🎯 Component state:', { 
    roomId, 
    loading, 
    status, 
    hasVideo, 
    isConnected,
    messagesCount: messages.length,
    videoSetupAttempted
  });

  // Main initialization effect - CHAT FIRST APPROACH
  useEffect(() => {
  console.log('🚀 Setting up auth state listener...');
  
  // Wait for Firebase Auth to be ready
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    console.log('🔐 Auth state changed:', { 
      user: user?.uid, 
      email: user?.email,
      roomId,
      initialized: initialized.current 
    });

    // Only proceed if we have all required data and haven't initialized yet
    if (!roomId || !user?.uid || initialized.current) {
      console.log('🛑 Skipping initialization:', { 
        roomId: !!roomId, 
        userId: !!user?.uid, 
        initialized: initialized.current 
      });
      return;
    }

    console.log('🚀 Starting initialization for room:', roomId);
    console.log('👤 Current user:', user.uid, user.email);
    initialized.current = true;

    const initializeConsultation = async () => {
      try {
        setLoading(true);
        setStatus('Setting up chat...');
        console.log('📝 Step 1: Setting up chat (priority)...');

        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // 1. Setup chat FIRST (this always works)
        const chatCleanup = setupChat();
        if (chatCleanup) {
          cleanupFunctions.current.push(chatCleanup);
        }
        console.log('✅ Chat setup completed - consultation is ready!');
        
        // 2. Chat is ready, user can start chatting
        setStatus('Chat ready - Loading video...');
        setLoading(false); // IMPORTANT: Allow chat immediately
        
        // 3. Try video setup in background (non-blocking)
        console.log('📝 Step 2: Attempting video setup in background...');
        setupVideoInBackground();
        
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        setError(error.message);
        setStatus('Chat ready');
        setLoading(false); // Still allow chat even if setup fails
      }
    };

    // Start initialization immediately
    initializeConsultation();
  });
  
  // Return cleanup function that includes auth listener cleanup
  return () => {
    console.log('🧹 Cleaning up consultation and auth listener...');
    unsubscribeAuth(); // Clean up auth listener
    cleanupAll();
  };
}, [roomId]); // Only depend on roomId, not auth.currentUser

  // Setup chat functionality (reliable) - FIXED
  const setupChat = () => {
    console.log('💬 Setting up chat...');
    
    try {
      // Ensure Firebase is properly initialized
      if (!db || !auth.currentUser) {
        console.error('❌ Firebase not ready for chat');
        return null;
      }

      console.log('📦 Creating Firestore query for room:', roomId);
      
      // First, try to load existing messages immediately
      loadMessagesOnce();
      
      // Then set up real-time listener
      const messagesQuery = query(
        collection(db, 'consultationMessages'),
        where('consultationId', '==', roomId),
        orderBy('timestamp', 'asc')
      );

      console.log('👂 Setting up real-time listener...');
      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          console.log('📨 Firestore snapshot received:', {
            size: snapshot.size,
            empty: snapshot.empty,
            metadata: snapshot.metadata,
            hasPendingWrites: snapshot.metadata.hasPendingWrites,
            fromCache: snapshot.metadata.fromCache
          });
          
          const newMessages = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('📄 Document data:', { id: doc.id, ...data });
            newMessages.push({ 
              id: doc.id, 
              ...data 
            });
          });
          
          console.log('💬 Setting messages state:', newMessages.length, newMessages);
          
          // Force state update with timestamp to ensure re-render
          setMessages(prevMessages => {
            console.log('🔄 Previous messages:', prevMessages.length);
            console.log('🔄 New messages:', newMessages.length);
            return [...newMessages];
          });
          
          // Auto-scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
        (error) => {
          console.error('❌ Chat listener error:', error);
          // Fallback to polling immediately
          setupChatPolling();
        }
      );

      console.log('✅ Chat real-time listener setup complete');
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Chat setup failed:', error);
      // Fallback to polling
      setupChatPolling();
      return null;
    }
  };

  // Load messages once immediately
  const loadMessagesOnce = async () => {
    try {
      console.log('📥 Loading messages once...');
      const messagesQuery = query(
        collection(db, 'consultationMessages'),
        where('consultationId', '==', roomId),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(messagesQuery);
      const newMessages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Initial load document:', { id: doc.id, ...data });
        newMessages.push({ 
          id: doc.id, 
          ...data 
        });
      });
      
      console.log('📥 Initial messages loaded:', newMessages.length, newMessages);
      setMessages([...newMessages]);
      
    } catch (error) {
      console.error('❌ Failed to load messages once:', error);
    }
  };

  // Fallback chat polling if real-time fails
  const setupChatPolling = () => {
    console.log('🔄 Setting up chat polling fallback...');
    
    const pollMessages = async () => {
      try {
        const messagesQuery = query(
          collection(db, 'consultationMessages'),
          where('consultationId', '==', roomId),
          orderBy('timestamp', 'asc')
        );
        
        const snapshot = await getDocs(messagesQuery);
        const newMessages = [];
        snapshot.forEach((doc) => {
          newMessages.push({ 
            id: doc.id, 
            ...doc.data() 
          });
        });
        
        console.log('📨 Polled messages:', newMessages.length, newMessages);
        setMessages([...newMessages]); // Force new array
        
      } catch (error) {
        console.warn('⚠️ Message polling error:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollMessages, 2000);
    pollMessages(); // Initial load
    
    return () => clearInterval(interval);
  };

  // Setup video in background (non-blocking)
  const setupVideoInBackground = async () => {
    if (videoSetupAttempted) {
      console.log('⏭️ Video setup already attempted');
      return;
    }

    setVideoSetupAttempted(true);
    console.log('🎥 Setting up video in background...');

    try {
      // First check if server is available
      const serverAvailable = await checkServerQuietly();
      if (!serverAvailable) {
        console.log('📝 Server not available - chat only mode');
        setStatus('Chat ready (Video server offline)');
        return;
      }

      // Try to get user media
      setStatus('Chat ready - Getting camera access...');
      const stream = await getUserMedia();
      
      if (stream) {
        setLocalStream(stream);
        setHasVideo(true);
        setupLocalVideo(stream);
        
        // Try WebRTC setup
        setStatus('Chat ready - Connecting video...');
        await setupWebRTCBackground(stream);
        
        setStatus('Ready - Video & Chat available');
      }

    } catch (error) {
      console.warn('⚠️ Video setup failed (non-critical):', error);
      setStatus('Chat ready (Video unavailable)');
      // Don't show error to user unless it's critical
    }
  };

  // Quiet server check (no user-facing errors)
  const checkServerQuietly = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
      
    } catch (error) {
      console.log('ℹ️ Server not available:', error.message);
      return false;
    }
  };

const getUserMedia = async () => {
  try {
    // First, check available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('🎥 Available devices:', devices.map(d => ({
      kind: d.kind,
      label: d.label,
      deviceId: d.deviceId
    })));
    
    // Check if we have required devices
    const hasVideo = devices.some(d => d.kind === 'videoinput');
    const hasAudio = devices.some(d => d.kind === 'audioinput');
    console.log('📊 Device availability:', { hasVideo, hasAudio });
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    console.log('✅ Got user media');
    console.log('🔍 Stream details:', {
      id: stream.id,
      active: stream.active,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });
    
    // Log track details
    stream.getTracks().forEach(track => {
      console.log(`📊 Track: ${track.kind}`, {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        label: track.label,
        settings: track.getSettings ? track.getSettings() : 'N/A'
      });
    });
    
    return stream;

  } catch (error) {
    console.error('❌ Camera access failed:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Camera/microphone permission denied. Please allow access and refresh the page.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No camera or microphone found on this device.');
    } else if (error.name === 'NotReadableError') {
      throw new Error('Camera/microphone is being used by another application.');
    } else if (error.name === 'OverconstrainedError') {
      throw new Error('Camera constraints not supported by this device.');
    } else {
      throw new Error(`Camera access failed: ${error.message}`);
    }
  }
};  

  // Setup local video display
  const setupLocalVideo = (stream) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      console.log('📺 Local video set');
    }const getUserMedia = async () => {
  try {
    // First, check available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('🎥 Available devices:', devices.map(d => ({
      kind: d.kind,
      label: d.label,
      deviceId: d.deviceId
    })));
    
    // Check if we have required devices
    const hasVideo = devices.some(d => d.kind === 'videoinput');
    const hasAudio = devices.some(d => d.kind === 'audioinput');
    console.log('📊 Device availability:', { hasVideo, hasAudio });
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    console.log('✅ Got user media');
    console.log('🔍 Stream details:', {
      id: stream.id,
      active: stream.active,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });
    
    // Log track details
    stream.getTracks().forEach(track => {
      console.log(`📊 Track: ${track.kind}`, {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        label: track.label,
        settings: track.getSettings ? track.getSettings() : 'N/A'
      });
    });
    
    return stream;

  } catch (error) {
    console.error('❌ Camera access failed:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Camera/microphone permission denied. Please allow access and refresh the page.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No camera or microphone found on this device.');
    } else if (error.name === 'NotReadableError') {
      throw new Error('Camera/microphone is being used by another application.');
    } else if (error.name === 'OverconstrainedError') {
      throw new Error('Camera constraints not supported by this device.');
    } else {
      throw new Error(`Camera access failed: ${error.message}`);
    }
  }
};

  };

  // Background WebRTC setup (very resilient)
  const setupWebRTCBackground = async (stream) => {
  // Add network connectivity check first
  console.log('🌐 Checking network connectivity before WebRTC setup...');
  const networkOk = await checkNetworkConnectivity();
  if (!networkOk) {
    console.warn('⚠️ Network connectivity issues detected');
    setError('Network connectivity issues - video may not work properly');
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ WebRTC setup timeout - continuing with local video only');
      resolve(); // Don't reject, just continue
    }, 10000); // Increased timeout

    try {
      console.log('🔌 Setting up WebRTC connections...');
      
      // Setup Socket.IO with more robust configuration
      const socket = io('http://localhost:3001', {
        transports: ['polling', 'websocket'],
        timeout: 5000, // Increased timeout
        reconnection: false,
        forceNew: true,
        autoConnect: true
      });
      
      socketRef.current = socket;

      // Setup PeerJS with more robust configuration
      const peer = new Peer(undefined, {
        host: 'localhost',
        port: 3001,
        path: '/peerjs/myapp',
        secure: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        },
        debug: 1 // Enable debug for more logs
      });
      
      peerRef.current = peer;

      // Connection tracking
      let socketConnected = false;
      let peerConnected = false;

      const checkIfComplete = () => {
        console.log('🔍 Connection status:', { socketConnected, peerConnected });
        if (socketConnected && peerConnected) {
          console.log('✅ WebRTC setup complete - both socket and peer ready');
          clearTimeout(timeout);
          resolve();
        }
      };

      // Enhanced Socket events
      socket.on('connect', () => {
        console.log('✅ Socket.IO connected successfully');
        console.log('🔍 Socket details:', {
          id: socket.id,
          connected: socket.connected,
          transport: socket.io.engine.transport.name
        });
        socketConnected = true;
        checkIfComplete();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setError(`Server connection failed: ${error.message}`);
        clearTimeout(timeout);
        resolve(); // Continue without socket
      });

      socket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
        socketConnected = false;
      });

      socket.on('user-connected', (userId) => {
        console.log('👤 User connected to room:', userId);
        console.log('🔍 Current peer ID:', peer.id);
        if (peer.id && peer.id !== userId) {
          console.log('📞 Initiating call to connected user...');
          setTimeout(() => makeCall(userId, stream), 2000); // Increased delay
        }
      });

      socket.on('user-disconnected', (userId) => {
        console.log('👋 User disconnected from room:', userId);
        handleUserDisconnected();
      });

      // Enhanced Peer events
      peer.on('open', (id) => {
        console.log('🔑 Peer connection established with ID:', id);
        console.log('🔍 Peer details:', {
          id: peer.id,
          destroyed: peer.destroyed,
          disconnected: peer.disconnected
        });
        
        if (socketConnected) {
          console.log('📡 Joining room via socket...');
          socket.emit('join-room', roomId, id);
        }
        peerConnected = true;
        checkIfComplete();
      });

        peer.on('call', (call) => {
  console.log('📞 Incoming video call from:', call.peer);
  console.log('🔍 Answering with local stream:', {
    id: stream.id,
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length
  });
  
  call.answer(stream);
  callRef.current = call;

  call.on('stream', (remoteStream) => {
    console.log('📹 Received remote stream from incoming call');
    console.log('🔍 Incoming stream details:', {
      id: remoteStream.id,
      active: remoteStream.active,
      videoTracks: remoteStream.getVideoTracks().length,
      audioTracks: remoteStream.getAudioTracks().length
    });
    handleRemoteStream(remoteStream);
  });

  call.on('close', () => {
    console.log('📞 Incoming call closed');
    handleUserDisconnected();
  });

  call.on('error', (error) => {
    console.error('❌ Incoming call error:', error);
    setError(`Incoming call failed: ${error.message}`);
  });
});


          peer.on('error', (error) => {
        console.error('❌ Peer connection error:', error);
        setError(`Peer connection failed: ${error.type} - ${error.message}`);
        clearTimeout(timeout);
        resolve(); // Continue without peer
      });

      peer.on('disconnected', () => {
        console.warn('⚠️ Peer disconnected from server');
        peerConnected = false;
        // Don't try to reconnect automatically
      });

      peer.on('close', () => {
        console.log('🔌 Peer connection closed');
        peerConnected = false;
      });

    } catch (error) {
      console.error('❌ WebRTC setup error:', error);
      setError(`Setup failed: ${error.message}`);
      clearTimeout(timeout);
      resolve(); // Always resolve to continue
    }
  });
};

// 3. REPLACE the makeCall function (around line 470)
const makeCall = (userId, stream) => {
  console.log('📞 Making video call to:', userId);
  console.log('🔍 Local stream for call:', {
    id: stream.id,
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length
  });
  
  if (!peerRef.current || peerRef.current.destroyed) {
    console.warn('⚠️ Cannot make call - peer not available');
    return;
  }

  try {
    const call = peerRef.current.call(userId, stream);
    callRef.current = call;
    
    console.log('📞 Call initiated successfully, waiting for response...');

    call.on('stream', (remoteStream) => {
      console.log('📹 Received remote stream from outgoing call');
      console.log('🔍 Received stream details:', {
        id: remoteStream.id,
        active: remoteStream.active,
        videoTracks: remoteStream.getVideoTracks().length,
        audioTracks: remoteStream.getAudioTracks().length
      });
      handleRemoteStream(remoteStream);
    });

    call.on('close', () => {
      console.log('📞 Outgoing call closed');
      handleUserDisconnected();
    });

    call.on('error', (error) => {
      console.error('❌ Outgoing call error:', error);
      // Try to reconnect or show error to user
      setError(`Call failed: ${error.message}`);
    });
  } catch (error) {
    console.error('❌ Failed to make call:', error);
    setError(`Failed to connect: ${error.message}`);
  }
};


  // Handle incoming remote stream
 const handleRemoteStream = (stream) => {
  console.log('📹 Setting up remote video stream');
  console.log('🔍 Remote stream details:', {
    id: stream.id,
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length
  });
  
  // Check if stream has actual tracks
  const videoTracks = stream.getVideoTracks();
  const audioTracks = stream.getAudioTracks();
  
  if (videoTracks.length === 0 && audioTracks.length === 0) {
    console.warn('⚠️ Received empty stream - no video or audio tracks');
    return;
  }
  
  // Log track details
  stream.getTracks().forEach(track => {
    console.log(`📊 Remote track: ${track.kind}`, {
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      label: track.label
    });
  });
  
  setRemoteStream(stream);
  setIsConnected(true);
  
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = stream;
    
    // Force video to play and handle autoplay issues
    const playPromise = remoteVideoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('⚠️ Remote video autoplay blocked:', error);
        // Try to enable play button or user interaction
      });
    }
  }
};
const checkNetworkConnectivity = async () => {
  try {
    console.log('🌐 Testing network connectivity...');
    // Test STUN server connectivity
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    return new Promise((resolve) => {
      let resolved = false;
      
      pc.onicecandidate = (event) => {
        if (event.candidate && !resolved) {
          console.log('🟢 ICE candidate found:', {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address
          });
          resolved = true;
          pc.close();
          resolve(true);
        }
      };
      
      pc.onicegatheringstatechange = () => {
        console.log('🔄 ICE gathering state:', pc.iceGatheringState);
      };
      
      // Create a dummy data channel to trigger ICE gathering
      pc.createDataChannel('test');
      pc.createOffer().then(offer => {
        console.log('📝 Created offer for connectivity test');
        return pc.setLocalDescription(offer);
      }).catch(error => {
        console.error('❌ Failed to create offer:', error);
        if (!resolved) {
          resolved = true;
          pc.close();
          resolve(false);
        }
      });
      
      // Timeout after 8 seconds
      setTimeout(() => {
        if (!resolved) {
          console.warn('⚠️ Network connectivity check timeout');
          resolved = true;
          pc.close();
          resolve(false);
        }
      }, 8000);
    });
  } catch (error) {
    console.error('❌ Network connectivity check failed:', error);
    return false;
  }
};


  // Handle user disconnection
  const handleUserDisconnected = () => {
    console.log('👋 Video user disconnected');
    setIsConnected(false);
    setRemoteStream(null);
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !roomId || !auth.currentUser) return;

    // File size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // File type check
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please upload images, PDFs, or documents.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setUploadingFile(true);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `consultations/${roomId}/${timestamp}_${safeFileName}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save file message to Firestore
      const fileMessage = {
        consultationId: roomId,
        type: 'file',
        fileName: file.name,
        fileUrl: downloadURL,
        fileSize: file.size,
        fileType: file.type,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email || 'User',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'consultationMessages'), fileMessage);
      
      // Force refresh messages
      setTimeout(() => loadMessagesOnce(), 500);

    } catch (error) {
      console.error('❌ File upload error:', error);
      setError('Failed to upload file. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = ''; // Reset input
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Send chat message - IMPROVED WITH REFRESH
  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !auth.currentUser) {
      console.warn('⚠️ Cannot send message - missing data');
      return;
    }

    console.log('📤 Sending message:', newMessage.trim());

    try {
      const messageData = {
        consultationId: roomId,
        text: newMessage.trim(),
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email || 'User',
        timestamp: serverTimestamp()
      };

      console.log('📦 Message data:', messageData);
      
      const docRef = await addDoc(collection(db, 'consultationMessages'), messageData);
      console.log('✅ Message sent with ID:', docRef.id);
      
      setNewMessage('');
      
      // FORCE REFRESH: Manually reload messages after sending
      setTimeout(() => {
        console.log('🔄 Force refreshing messages after send...');
        loadMessagesOnce();
      }, 500);
      
      // Force scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 600);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Show user-friendly error
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

   const handleEndCall = async () => {
  try {
    console.log('🔚 Ending consultation...');
    
    // STEP 1: Stop camera and microphone first
    console.log('📹 Stopping camera and microphone...');
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop(); // This turns off camera/mic
      });
      setLocalStream(null);
      setHasVideo(false);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
    }
    
    // STEP 2: Close video connections
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // STEP 3: Update consultation status in database
    console.log('💾 Updating consultation status...');
    const consultationRef = doc(db, 'consultations', roomId);
    await updateDoc(consultationRef, {
      status: 'completed',
      endedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });

    // STEP 4: Send notification to patient
    console.log('📨 Sending end notification...');
    await addDoc(collection(db, 'notifications'), {
      userId: '', // Will be filled by the other participant
      type: 'consultation_ended',
      title: 'Consultation Ended',
      message: 'The consultation has been completed.',
      consultationId: roomId,
      status: 'unread',
      createdAt: serverTimestamp()
    });

    console.log('✅ Consultation ended successfully');
    
    // STEP 5: Final cleanup and navigate back
    cleanupAll();
    navigate('/doctorDashboard'); // Go back to doctor dashboard
    
  } catch (error) {
    console.error('❌ Error ending consultation:', error);
    
    // STILL STOP CAMERA/MIC even if database update fails
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`🛑 Emergency stopping ${track.kind} track`);
        track.stop();
      });
    }
    
    // Still navigate back even if database update fails
    cleanupAll();
    navigate('/doctorDashboard');
  }
};

  // Retry video setup
  const retryVideoSetup = () => {
    setVideoSetupAttempted(false);
    setError('');
    setStatus('Retrying video setup...');
    setupVideoInBackground();
  };

  // Comprehensive cleanup function
  const cleanupAll = () => {
    console.log('🧹 Cleaning up all resources...');
    
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
    }
    
    // Close call
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    
    // Destroy peer
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Run all cleanup functions
    cleanupFunctions.current.forEach(cleanup => {
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.warn('⚠️ Cleanup function error:', error);
      }
    });

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setHasVideo(false);
  };

  // Handle Enter key in chat
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5'
    }}>
      {/* Error Banner */}
      {error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#ff9800', // Orange instead of red for warnings
          color: 'white',
          padding: '12px 20px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span>⚠️ {error}</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {!hasVideo && (
              <button 
                onClick={retryVideoSetup}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: '1px solid white', 
                  color: 'white', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                Retry Video
              </button>
            )}
            <button 
              onClick={() => setError('')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 5px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay - Only show for initial chat setup */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 999
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>{status}</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Setting up chat...</div>
        </div>
      )}

      {/* Video Section */}
      {hasVideo && (
        <div style={{ 
          flex: 1, 
          background: '#000', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2px',
          minHeight: '100vh'
        }}>
          {/* Local Video */}
          <div style={{ position: 'relative', background: '#222' }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transform: 'scaleX(-1)' // Mirror effect
              }}
            />
            
            {/* Local video label */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              You {!isVideoEnabled && '(Video Off)'}
            </div>

            {/* Control buttons */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              right: '15px',
              display: 'flex',
              gap: '8px'
            }}>
              <button 
                onClick={toggleVideo}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(220,53,69,0.8)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoEnabled ? '📹' : '📷'}
              </button>
              
              <button 
                onClick={toggleAudio}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(220,53,69,0.8)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                title={isAudioEnabled ? 'Mute audio' : 'Unmute audio'}
              >
                {isAudioEnabled ? '🎤' : '🔇'}
              </button>

                 {/* End Call Button */}
              <button 
                onClick={handleEndCall}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(220,53,69,0.9)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                title="End consultation"
              >
                📞
              </button>
            </div>
            

            {/* Connection status */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: isConnected ? 'rgba(40,167,69,0.9)' : 'rgba(255,193,7,0.9)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '15px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {isConnected ? '🟢 Connected' : '🟡 Waiting'}
            </div>
          </div>

          {/* Remote Video */}
          <div style={{ position: 'relative', background: '#333' }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
            
            {/* Remote video label */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {remoteStream ? 'Other Participant' : 'Waiting...'}
            </div>

            {/* Waiting message */}
            {!remoteStream && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.7 }}>👤</div>
                <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                  Waiting for other participant
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  Share this room URL to connect
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Section */}
      <div style={{ 
        width: hasVideo ? '400px' : '100%',
        display: 'flex', 
        flexDirection: 'column',
        background: 'white',
        borderLeft: hasVideo ? '1px solid #e0e0e0' : 'none',
        boxShadow: hasVideo ? '-2px 0 4px rgba(0,0,0,0.1)' : 'none'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          background: '#f8f9fa',

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center'
        }}>
          <div>

          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💬 Consultation Chat
            {messages.length > 0 && (
              <span style={{
                background: '#007bff',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px'
              }}>
                {messages.length}
              </span>
            )}
          </h3>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {hasVideo ? '📹 Video ready' : '💬 Chat ready'} • {status}

            </div>
            </div>

            {/* Manual refresh button for debugging */}
            <button 
              onClick={loadMessagesOnce}
              style={{
                marginLeft: '10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          
        

         {/* End Call Button in Chat Header (for chat-only mode) */}
          {!hasVideo && (
            <button 
              onClick={handleEndCall}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              title="End consultation"
            >
              📞 End Chat
            </button>
          )}
        </div>


        {/* Messages Area */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 140px)'
        }}>
          
          
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              fontStyle: 'italic',
              padding: '40px 20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}>💬</div>
              <div>No messages yet</div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                Start the conversation!
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              // Debug log each message
               const isFile = message.type === 'file';
              const isImage = isFile && message.fileType?.startsWith('image/');
              
              return (
                <div
                  key={message.id || `msg-${index}`}
                  style={{
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: message.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      background: message.senderId === auth.currentUser?.uid ? '#007bff' : '#f1f3f4',
                      color: message.senderId === auth.currentUser?.uid ? 'white' : '#333',
                      wordWrap: 'break-word',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      position: 'relative'
                    }}
                  >
                   {/* Regular text message */}

                    {!isFile && <div>{message.text || 'No text'}</div>}

                    {/* File message */}
                    {isFile && (
                      <div>
                        {/* Image preview */}
                        {isImage && (
                          <div style={{ marginBottom: '8px' }}>
                            <img 
                              src={message.fileUrl}
                              alt={message.fileName}
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                          </div>
                        )}
                        
                        {/* File info */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          background: 'rgba(255,255,255,0.1)',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            {isImage ? '🖼️' : 
                             message.fileType === 'application/pdf' ? '📄' : '📎'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{message.fileName}</div>
                            <div style={{ opacity: 0.8 }}>
                              {(message.fileSize / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(message.fileUrl, '_blank')}
                            style={{
                              background: 'rgba(255,255,255,0.2)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              color: 'inherit',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            {isImage ? 'View' : 'Download'}
                          </button>
                        </div>
                      </div>
                    )}


                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.7, 
                      marginTop: '5px',
                      textAlign: 'right'
                    }}>
                      {message.timestamp?.toDate ? 
                        message.timestamp.toDate().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        (message.timestamp ? 'Processing...' : 'Sending...')
                      }
                    </div>
                   
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #e0e0e0',
          background: '#f8f9fa'
        }}>

            {/* File upload indicator */}
          {uploadingFile && (
            <div style={{
              background: '#e3f2fd',
              color: '#1976d2',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '10px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(25,118,210,0.3)',
                borderTop: '2px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Uploading file...
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>

           {/* File attachment button */}
            <button 
              onClick={triggerFileInput}
              disabled={uploadingFile}
              style={{
                padding: '12px',
                background: uploadingFile ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: uploadingFile ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              title="Attach file (Images, PDFs, Documents)"
            >
              📎
            </button>

            {/* Add this button temporarily for testing */}
<button 
  onClick={async () => {
    console.log('🧪 Running manual connectivity test...');
    const result = await checkNetworkConnectivity();
    console.log('🧪 Connectivity result:', result);
    alert(`Network connectivity: ${result ? 'OK' : 'FAILED'}`);
  }}
  style={{
    position: 'fixed',
    top: '60px',
    right: '20px',
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 1001
  }}
>
  🧪 Test Network
</button>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
            />

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
                   disabled={uploadingFile}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                minHeight: '20px',
                maxHeight: '100px',
                fontFamily: 'inherit',
                opacity: uploadingFile ? 0.6 : 1
              }}
              rows={1}
            />
            <button 
              onClick={sendMessage}
              disabled={(!newMessage.trim() && !uploadingFile) || uploadingFile}
              style={{
                padding: '12px 20px',
                background: (newMessage.trim() && !uploadingFile) ? '#007bff' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: (newMessage.trim() && !uploadingFile) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                minWidth: '70px'
              }}
            >
              Send
            </button>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '8px', 
            textAlign: 'center' 
          }}>
            Press Enter to send • Shift+Enter for new line • 📎 to attach files
            {!hasVideo && !videoSetupAttempted && (
              <span> • <button 
                onClick={retryVideoSetup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '12px'
                }}
              >
                Enable Video
              </button></span>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConsultationRoom;