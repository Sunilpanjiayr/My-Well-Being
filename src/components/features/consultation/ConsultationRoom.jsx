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
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';

import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [consultationData, setConsultationData] = useState(null);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const cleanupFunctions = useRef([]);
  const initializationRef = useRef(false);

  console.log('🎯 Component state:', { 
    roomId, 
    loading, 
    status, 
    jitsiLoaded,
    videoReady,
    messagesCount: messages.length
  });

  // Main initialization effect
  useEffect(() => {
    if (initializationRef.current) return;
    
    console.log('🚀 Setting up consultation room...');
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', { 
        user: user?.uid, 
        email: user?.email,
        roomId
      });

      if (!roomId || !user?.uid) {
        console.log('🛑 Missing required data');
        setError('Missing authentication or room data');
        setLoading(false);
        return;
      }

      if (initializationRef.current) {
        console.log('🛑 Already initialized, skipping...');
        return;
      }

      // Store user info
      setUserInfo(user);
      initializationRef.current = true;
      console.log('🚀 Starting initialization for room:', roomId);
      initializeConsultation(user);
    });
    
    return () => {
      console.log('🧹 Cleaning up consultation...');
      unsubscribeAuth();
      cleanupAll();
    };
  }, [roomId]);

  // Initialize consultation
  const initializeConsultation = async (user) => {
    try {
      setLoading(true);
      setStatus('Loading consultation details...');
      console.log('📝 Step 1: Loading consultation details...');

      // Get consultation data from Firestore
      const consultationDoc = await getDoc(doc(db, 'consultations', roomId));
      if (consultationDoc.exists()) {
        const data = consultationDoc.data();
        setConsultationData(data);
        console.log('📄 Consultation data loaded:', data);
      } else {
        throw new Error('Consultation not found');
      }

      setStatus('Setting up chat...');
      console.log('📝 Step 2: Setting up chat...');

      // Setup chat
      const chatCleanup = setupChat();
      if (chatCleanup) {
        cleanupFunctions.current.push(chatCleanup);
      }
      
      console.log('✅ Chat setup completed');
      setStatus('Chat ready - Loading video...');
      setLoading(false);
      
      // Setup video with consultation-specific room
      console.log('📝 Step 3: Setting up consultation video...');
      setTimeout(() => {
        setupConsultationVideo(user);
      }, 500);
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      setError(error.message);  
      setStatus('Chat ready');
      setLoading(false);
    }
  };

  // Setup video conference with consultation-specific room name
  const setupConsultationVideo = async (user) => {
    try {
      console.log('🌐 Setting up consultation-specific video conference...');
      setStatus('Loading video conference...');

      if (!jitsiContainerRef.current) {
        console.error('❌ Container not ready');
        throw new Error('Video container not ready');
      }

      // Clear container
      jitsiContainerRef.current.innerHTML = '';

      // Generate deterministic room name based on consultation data
      const roomName = generateConsultationRoomName();
      
      // Get user display name and role
      const displayName = getUserDisplayName(user);
      const userRole = await getUserRole(user.uid);
      
      console.log('🎬 Creating consultation room:', { 
        roomName, 
        displayName, 
        userRole,
        consultationId: roomId 
      });

      // Create iframe with consultation-specific configuration
      const iframe = document.createElement('iframe');
      
      // Build Jitsi URL with consultation parameters
      const jitsiUrl = buildJitsiUrl(roomName, displayName, userRole);
      
      iframe.src = jitsiUrl;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.allow = 'camera; microphone; display-capture; fullscreen; autoplay';
      iframe.allowFullscreen = true;
      iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation';
      
      // Add iframe to container
      jitsiContainerRef.current.appendChild(iframe);
      
      // Set loaded after delay
      setTimeout(() => {
        setJitsiLoaded(true);
        setVideoReady(true);
        setStatus('Video conference ready');
        setError('');
        sendSystemMessage(`Video conference started for consultation ${roomId}`);
        console.log('✅ Consultation video conference loaded successfully');
      }, 3000);

      // Store video room info in consultation document
      await updateConsultationWithVideoRoom(roomName, userRole);
      
    } catch (error) {
      console.error('❌ Video setup failed:', error);
      setupFallbackVideo(user);
    }
  };

  // Generate deterministic room name for this consultation
  const generateConsultationRoomName = () => {
    if (!consultationData) {
      // Fallback to roomId-based name
      return `consultation-${roomId}`;
    }

    // Create deterministic room name based on consultation data
    const doctorId = consultationData.doctorId || 'unknown';
    const patientId = consultationData.patientId || consultationData.userId || 'unknown';
    const scheduledTime = consultationData.scheduledDateTime || consultationData.createdAt;
    
    // Create hash-like string for consistency
    const hashInput = `${doctorId}-${patientId}-${roomId}`;
    const roomSuffix = btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    
    return `health-consult-${roomSuffix}`;
  };

  // Get user display name
  const getUserDisplayName = (user) => {
    if (user.displayName && user.displayName.trim()) {
      return user.displayName.trim();
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return `User${Math.random().toString(36).substr(2, 4)}`;
  };

  // Determine user role (doctor or patient)
  const getUserRole = async (userId) => {
    try {
      // Check if user is a doctor
      const doctorDoc = await getDoc(doc(db, 'doctors', userId));
      if (doctorDoc.exists()) {
        return 'doctor';
      }
      
      // Check if user is a patient/user
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return 'patient';
      }
      
      return 'participant';
    } catch (error) {
      console.error('Error determining user role:', error);
      return 'participant';
    }
  };

  // Build Jitsi URL with specific parameters
  const buildJitsiUrl = (roomName, displayName, userRole) => {
    const baseUrl = `https://meet.jit.si/${roomName}`;
    
    // Build configuration parameters
    const config = {
      // User identification
      'userInfo.displayName': displayName,
      
      // Basic configuration
      'config.startWithVideoMuted': 'false',
      'config.startWithAudioMuted': 'false',
      'config.prejoinPageEnabled': 'false',
      'config.requireDisplayName': 'false',
      
      // Authentication and access
      'config.enableAuth': 'false',
      'config.enableGuests': 'true',
      'config.disableDeepLinking': 'true',
      
      // Features
      'config.enableWelcomePage': 'false',
      'config.enableClosePage': 'false',
      'config.analytics.disabled': 'true',
      
      // Lobby settings (disabled for healthcare)
      'config.lobby.enabled': 'false',
      'config.enableLobbyChat': 'false',
      
      // Interface customization
      'interfaceConfig.SHOW_JITSI_WATERMARK': 'false',
      'interfaceConfig.SHOW_WATERMARK_FOR_GUESTS': 'false',
      'interfaceConfig.SHOW_BRAND_WATERMARK': 'false',
      'interfaceConfig.APP_NAME': 'Health Consultation',
      
      // Notifications
      'interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS': 'true',
      'interfaceConfig.DISABLE_PRESENCE_STATUS': 'true',
    };

    // Add role-specific configurations
    if (userRole === 'doctor') {
      config['config.startAudioOnly'] = 'false';
      config['config.channelLastN'] = '10'; // Doctors can see more participants
    } else if (userRole === 'patient') {
      config['config.startAudioOnly'] = 'false';
    }

    // Convert config to URL parameters
    const params = new URLSearchParams(config);
    
    return `${baseUrl}#${params.toString()}`;
  };

  // Update consultation document with video room information
  const updateConsultationWithVideoRoom = async (roomName, userRole) => {
    try {
      const updateData = {
        videoRoomName: roomName,
        videoStatus: 'active',
        lastVideoActivity: serverTimestamp(),
      };

      // Add participant info
      if (!consultationData.participants) {
        updateData.participants = [];
      }
      
      updateData[`participants.${auth.currentUser.uid}`] = {
        displayName: getUserDisplayName(auth.currentUser),
        role: userRole,
        joinedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'consultations', roomId), updateData);
      console.log('✅ Updated consultation with video room info');
    } catch (error) {
      console.error('❌ Failed to update consultation with video info:', error);
    }
  };

  // Fallback video setup
  const setupFallbackVideo = (user) => {
    try {
      console.log('🔄 Setting up fallback video...');
      
      if (!jitsiContainerRef.current) return;

      const timestamp = Date.now();
      const fallbackRoomName = `fallback-health-${timestamp}`;
      
      // Create simple iframe
      const iframe = document.createElement('iframe');
      iframe.src = `https://meet.jit.si/${fallbackRoomName}`;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.allow = 'camera; microphone; fullscreen';
      iframe.allowFullscreen = true;
      
      jitsiContainerRef.current.innerHTML = '';
      jitsiContainerRef.current.appendChild(iframe);
      
      setTimeout(() => {
        setJitsiLoaded(true);
        setVideoReady(true);
        setStatus('Video conference ready (fallback mode)');
        setError('');
        sendSystemMessage('Video conference ready (using fallback room)');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Fallback video setup failed:', error);
      setChatOnlyMode();
    }
  };

  // Set chat-only mode
  const setChatOnlyMode = () => {
    setJitsiLoaded(false);
    setVideoReady(false);
    setStatus('Chat only mode');
    setError('');
    sendSystemMessage('Video unavailable - Continuing with chat only');
    
    if (jitsiContainerRef.current) {
      jitsiContainerRef.current.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8f9fa;
          color: #666;
          text-align: center;
          padding: 40px;
        ">
          <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">💬</div>
          <h3 style="margin: 0 0 10px 0; color: #333;">Chat Only Mode</h3>
          <p style="margin: 0; font-size: 14px;">Video unavailable for this consultation</p>
          <button 
            onclick="window.location.reload()" 
            style="
              margin-top: 15px; 
              padding: 8px 16px; 
              background: #007bff; 
              color: white; 
              border: none; 
              border-radius: 6px; 
              cursor: pointer;
            "
          >
            Try Video Again
          </button>
        </div>
      `;
    }
  };

  // Send system message to chat
  const sendSystemMessage = async (message) => {
    try {
      await addDoc(collection(db, 'consultationMessages'), {
        consultationId: roomId,
        text: message,
        type: 'system',
        senderId: 'system',
        senderName: 'System',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Failed to send system message:', error);
    }
  };

  // Setup chat functionality
  const setupChat = () => {
    console.log('💬 Setting up chat...');
    
    try {
      if (!db || !auth.currentUser) {
        console.error('❌ Firebase not ready for chat');
        return null;
      }

      console.log('📦 Creating Firestore query for room:', roomId);
      
      // Load existing messages
      loadMessagesOnce();
      
      // Set up real-time listener
      const messagesQuery = query(
        collection(db, 'consultationMessages'),
        where('consultationId', '==', roomId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          console.log('📨 Firestore snapshot received:', snapshot.size);
          
          const newMessages = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            newMessages.push({ 
              id: doc.id, 
              ...data 
            });
          });
          
          console.log('💬 Setting messages state:', newMessages.length);
          setMessages([...newMessages]);
          
          // Auto-scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
        (error) => {
          console.error('❌ Chat listener error:', error);
        }
      );

      console.log('✅ Chat real-time listener setup complete');
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Chat setup failed:', error);
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
        newMessages.push({ 
          id: doc.id, 
          ...doc.data() 
        });
      });
      
      console.log('📥 Initial messages loaded:', newMessages.length);
      setMessages([...newMessages]);
      
    } catch (error) {
      console.error('❌ Failed to load messages once:', error);
    }
  };

  // File upload handling
  const handleFileUpload = async (file) => {
    if (!file || !roomId || !auth.currentUser) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

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
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `consultations/${roomId}/${timestamp}_${safeFileName}`;
      
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

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
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !auth.currentUser) {
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

      await addDoc(collection(db, 'consultationMessages'), messageData);
      setNewMessage('');
      
      setTimeout(() => {
        loadMessagesOnce();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // End consultation
  const handleEndCall = async () => {
    try {
      console.log('🔚 Ending consultation...');
      
      // Close Jitsi meeting
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (disposeError) {
          console.warn('⚠️ Error disposing Jitsi:', disposeError);
        }
        jitsiApiRef.current = null;
      }
      
      // Update consultation status
      console.log('💾 Updating consultation status...');
      const consultationRef = doc(db, 'consultations', roomId);
      await updateDoc(consultationRef, {
        status: 'completed',
        endedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        videoStatus: 'ended'
      });

      // Send notification
      await sendSystemMessage('Consultation has been ended.');

      console.log('✅ Consultation ended successfully');
      cleanupAll();
      
      // Navigate based on user role
      const userRole = await getUserRole(auth.currentUser.uid);
      if (userRole === 'doctor') {
        navigate('/doctorDashboard');
      } else {
        navigate('/dashboardHome');
      }
      
    } catch (error) {
      console.error('❌ Error ending consultation:', error);
      cleanupAll();
      navigate('/dashboardHome'); // Fallback navigation
    }
  };

  // Cleanup function
  const cleanupAll = () => {
    console.log('🧹 Cleaning up all resources...');
    
    // Dispose Jitsi meeting
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (error) {
        console.warn('⚠️ Error disposing Jitsi:', error);
      }
      jitsiApiRef.current = null;
    }

    // Run cleanup functions
    cleanupFunctions.current.forEach(cleanup => {
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.warn('⚠️ Cleanup function error:', error);
      }
    });

    setJitsiLoaded(false);
    setVideoReady(false);
    initializationRef.current = false;
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
      background: '#f5f5f5',
      flexDirection: 'column'
    }}>
      {/* HEADER */}
      {!headerCollapsed && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '22px' }}>🏥</span>
              My Well Being
            </div>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.9,
              background: 'rgba(255,255,255,0.2)',
              padding: '3px 8px',
              borderRadius: '10px'
            }}>
              Consultation Room {consultationData && `• ${consultationData.type || 'General'}`}
            </div>
          </div>
          <button 
            onClick={() => setHeaderCollapsed(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Collapse header"
          >
            ×
          </button>
        </div>
      )}

      {/* COLLAPSED HEADER BUTTON */}
      {headerCollapsed && (
        <div style={{
          position: 'fixed',
          top: '8px',
          left: '8px',
          zIndex: 1001
        }}>
          <button 
            onClick={() => setHeaderCollapsed(false)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            🏥 Show Header
          </button>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div style={{
          position: 'fixed',
          top: headerCollapsed ? '0' : '46px',
          left: 0,
          right: 0,
          background: '#ff9800',
          color: 'white',
          padding: '10px 20px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ {error}</span>
          <button 
            onClick={() => setError('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* LOADING OVERLAY */}
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
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Setting up consultation...</div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ 
        display: 'flex', 
        flex: 1,
        height: headerCollapsed ? '100vh' : 'calc(100vh - 46px)'
      }}>
        {/* Video Section */}
        <div style={{ 
          flex: jitsiLoaded ? 1 : 0,
          width: jitsiLoaded ? 'auto' : '0px',
          background: '#000',
          minHeight: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div 
            ref={jitsiContainerRef}
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '100%',
              display: jitsiLoaded ? 'block' : 'none'
            }}
          />
        </div>

        {/* Chat Section */}
        <div style={{ 
          width: jitsiLoaded ? '400px' : '100%',
          display: 'flex', 
          flexDirection: 'column',
          background: 'white',
          borderLeft: jitsiLoaded ? '1px solid #e0e0e0' : 'none',
          boxShadow: jitsiLoaded ? '-2px 0 4px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e0e0e0',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                💬 Chat
                {messages.length > 0 && (
                  <span style={{
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '1px 5px',
                    fontSize: '10px'
                  }}>
                    {messages.length}
                  </span>
                )}
              </h3>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '1px' }}>
                {jitsiLoaded ? '🎥 Video active' : '💬 Chat ready'} • {status}
              </div>
            </div>

            {/* End Call Button */}
            <button 
              onClick={handleEndCall}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              📞 End
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ 
            flex: 1, 
            padding: '15px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 120px)'
          }}>
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                padding: '30px 15px'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.5 }}>💬</div>
                <div style={{ fontSize: '14px' }}>No messages yet</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  Start the conversation!
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isFile = message.type === 'file';
                const isSystem = message.type === 'system';
                const isImage = isFile && message.fileType?.startsWith('image/');
                
                return (
                  <div
                    key={message.id || `msg-${index}`}
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: isSystem ? 'center' : 
                        (message.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start')
                    }}
                  >
                    <div
                      style={{
                        maxWidth: isSystem ? '90%' : '75%',
                        padding: isSystem ? '6px 10px' : '10px 14px',
                        borderRadius: isSystem ? '10px' : '16px',
                        background: isSystem ? '#e3f2fd' : 
                          (message.senderId === auth.currentUser?.uid ? '#007bff' : '#f1f3f4'),
                        color: isSystem ? '#1976d2' : 
                          (message.senderId === auth.currentUser?.uid ? 'white' : '#333'),
                        wordWrap: 'break-word',
                        fontSize: isSystem ? '11px' : '13px',
                        fontStyle: isSystem ? 'italic' : 'normal',
                        lineHeight: '1.3',
                        textAlign: isSystem ? 'center' : 'left'
                      }}
                    >
                      {/* System message */}
                      {isSystem && <div>🔔 {message.text}</div>}

                      {/* Regular text message */}
                      {!isFile && !isSystem && <div>{message.text}</div>}

                      {/* File message */}
                      {isFile && (
                        <div>
                          {/* Image preview */}
                          {isImage && (
                            <div style={{ marginBottom: '6px' }}>
                              <img 
                                src={message.fileUrl}
                                alt={message.fileName}
                                style={{
                                  maxWidth: '180px',
                                  maxHeight: '180px',
                                  borderRadius: '6px',
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
                            gap: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}>
                            <span style={{ fontSize: '14px' }}>
                              {isImage ? '🖼️' : 
                               message.fileType === 'application/pdf' ? '📄' : '📎'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{message.fileName}</div>
                              <div style={{ opacity: 0.8, fontSize: '10px' }}>
                                {(message.fileSize / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(message.fileUrl, '_blank')}
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'inherit',
                                borderRadius: '3px',
                                padding: '3px 6px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              {isImage ? 'View' : 'Download'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      {!isSystem && (
                        <div style={{ 
                          fontSize: '10px', 
                          opacity: 0.7, 
                          marginTop: '4px',
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
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ 
            padding: '15px', 
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa'
          }}>
            {/* File upload indicator */}
            {uploadingFile && (
              <div style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '6px 10px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(25,118,210,0.3)',
                  borderTop: '2px solid #1976d2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Uploading file...
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              {/* File attachment button */}
              <button 
                onClick={triggerFileInput}
                disabled={uploadingFile}
                style={{
                  padding: '10px',
                  background: uploadingFile ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: uploadingFile ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  width: '38px',
                  height: '38px',
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
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '18px',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  minHeight: '18px',
                  maxHeight: '80px',
                  fontFamily: 'inherit',
                  opacity: uploadingFile ? 0.6 : 1
                }}
                rows={1}
              />
              
              <button 
                onClick={sendMessage}
                disabled={(!newMessage.trim() && !uploadingFile) || uploadingFile}
                style={{
                  padding: '10px 16px',
                  background: (newMessage.trim() && !uploadingFile) ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  cursor: (newMessage.trim() && !uploadingFile) ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  minWidth: '60px'
                }}
              >
                Send
              </button>
            </div>
            
            <div style={{ 
              fontSize: '11px', 
              color: '#666', 
              marginTop: '6px', 
              textAlign: 'center' 
            }}>
              Press Enter to send • Shift+Enter for new line • 📎 to attach files
              {!jitsiLoaded && (
                <div style={{ marginTop: '3px', color: '#007bff' }}>
                  🎥 Video conference loading...
                </div>
              )}
              {error && (
                <div style={{ marginTop: '3px', color: '#dc3545', fontSize: '10px' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ConsultationRoom;