import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import SignalingService from '../../../services/BulletproofSignalingService';
import './ConsultationRoom.css';

const ConsultationRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const consultationType = new URLSearchParams(location.search).get('type') || 'video';
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatMode] = useState(consultationType === 'chat');
  const [connectionState, setConnectionState] = useState('new');
  const [isConnected, setIsConnected] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const isInitializing = useRef(false);
  const pendingCandidates = useRef([]);
  const hasRemoteDescription = useRef(false);
  const streamCleanupRef = useRef(null);
  const initTimeoutRef = useRef(null);
  const offerTimeoutRef = useRef(null);
  const isCleaningUp = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Enhanced camera access with better error handling
  const requestUserMedia = useCallback(async () => {
    console.log('🎥 Requesting user media...');
    
    const constraintOptions = [
      // Try basic quality first to avoid conflicts
      {
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        },
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true
        }
      },
      // Fallback to very basic
      {
        video: { 
          width: 320, 
          height: 240,
          frameRate: 15
        },
        audio: true
      },
      // Audio only
      {
        video: false,
        audio: true
      }
    ];

    for (let i = 0; i < constraintOptions.length; i++) {
      try {
        console.log(`🔄 Trying constraint option ${i + 1}:`, constraintOptions[i]);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraintOptions[i]);
        
        console.log('✅ Got media stream:', {
          id: stream.id,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          active: stream.active
        });

        return stream;
        
      } catch (err) {
        console.warn(`⚠️ Constraint option ${i + 1} failed:`, err.message);
        
        if (err.name === 'NotAllowedError') {
          throw new Error('Camera/microphone access denied. Please allow permissions and refresh.');
        } else if (err.name === 'NotReadableError') {
          if (i < 2) continue; // Try next option
          throw new Error('Camera is busy. Please close other tabs/applications using the camera.');
        }
        
        if (i === constraintOptions.length - 1) {
          throw err;
        }
      }
    }
  }, []);

  // FIXED: Simplified and more reliable video setup
  const setupVideoElement = useCallback((videoElement, stream, isLocal = false) => {
    if (!videoElement || !stream) {
      console.warn('⚠️ Cannot setup video: missing element or stream');
      return false;
    }

    console.log(`🎬 Setting up ${isLocal ? 'local' : 'remote'} video element`);
    
    try {
      // Clear existing source
      videoElement.srcObject = null;
      videoElement.pause();
      
      // Set properties
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.muted = isLocal;
      videoElement.controls = false;
      
      // Apply styles directly
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      videoElement.style.background = '#000';
      
      if (isLocal) {
        videoElement.style.transform = 'scaleX(-1)';
      }
      
      // Set stream
      videoElement.srcObject = stream;
      
      // Force play attempt
      const playVideo = async () => {
        try {
          await videoElement.play();
          console.log(`✅ ${isLocal ? 'Local' : 'Remote'} video playing`);
          return true;
        } catch (e) {
          console.warn(`⚠️ ${isLocal ? 'Local' : 'Remote'} video autoplay failed:`, e.message);
          
          // For local video, it's often not critical due to autoplay policies
          if (isLocal) {
            console.log('📺 Local video stream set (autoplay blocked but video should show)');
            return true;
          }
          
          return false;
        }
      };
      
      // Immediate play attempt
      playVideo();
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error setting up ${isLocal ? 'local' : 'remote'} video:`, error);
      return false;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;
    
    console.log('🧹 Cleaning up WebRTC resources...');
    
    // Clear timeouts
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (offerTimeoutRef.current) {
      clearTimeout(offerTimeoutRef.current);
      offerTimeoutRef.current = null;
    }
    
    // Stop stream cleanup
    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }
    
    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
    }

    // Clean up peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
        console.log('🔌 Closed peer connection');
      } catch (e) {
        console.warn('Warning closing peer connection:', e);
      }
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    hasRemoteDescription.current = false;
    pendingCandidates.current = [];
    setConnectionState('new');
    setIsConnected(false);

    // Disconnect signaling service
    try {
      if (SignalingService && SignalingService.isConnected && SignalingService.isConnected()) {
        SignalingService.disconnect();
      }
    } catch (e) {
      console.warn('Warning disconnecting signaling:', e);
    }
    
    isCleaningUp.current = false;
  }, [localStream]);

  const processPendingCandidates = useCallback(async () => {
    if (!peerConnectionRef.current || !hasRemoteDescription.current) return;

    console.log(`🧊 Processing ${pendingCandidates.current.length} pending candidates`);
    
    for (const candidate of pendingCandidates.current) {
      try {
        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ Added pending ICE candidate');
        }
      } catch (err) {
        console.error('❌ Error adding pending candidate:', err);
      }
    }
    
    pendingCandidates.current = [];
  }, []);

  const createPeerConnection = useCallback(async (stream) => {
    // Clean up existing connection
    if (peerConnectionRef.current) {
      console.log('🔄 Cleaning up existing peer connection...');
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('Warning closing existing PC:', e);
      }
      peerConnectionRef.current = null;
    }

    console.log('🔗 Creating new peer connection...');
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });

    // Add local tracks
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, stream);
          console.log(`✅ Added local ${track.kind} track`);
        } catch (e) {
          console.error('Error adding track:', e);
        }
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log('📺 Received remote track:', event.track.kind);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        console.log('🎥 Setting remote stream');
        setRemoteStream(remoteStream);
        
        // Setup remote video
        setTimeout(() => {
          if (remoteVideoRef.current && !isCleaningUp.current) {
            setupVideoElement(remoteVideoRef.current, remoteStream, false);
          }
        }, 100);
      }
    };

    // ICE candidate handling
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && !isCleaningUp.current) {
        console.log('🧊 Generated ICE candidate');
        SignalingService.sendSignal({ 
          type: 'ice-candidate',
          candidate: {
            candidate: candidate.candidate,
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdpMid: candidate.sdpMid,
            usernameFragment: candidate.usernameFragment
          }
        });
      }
    };

    // Connection state handling
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('🔄 Connection state:', state);
      setConnectionState(state);
      
      if (state === 'connected') {
        setIsConnected(true);
        setLoading(false);
        setLoadingStatus('');
        setError('');
        console.log('🎉 WebRTC connection established!');
      } else if (state === 'failed') {
        console.error('❌ Connection failed');
        setError('Connection failed. Network or firewall issues may be preventing the connection.');
        setIsConnected(false);
      } else if (state === 'disconnected') {
        console.warn('⚠️ Connection disconnected');
        setIsConnected(false);
      }
    };

    // ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE state:', pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [setupVideoElement]);

  const handleSignal = useCallback(async (data) => {
    const pc = peerConnectionRef.current;
    if (!pc || pc.signalingState === 'closed' || isCleaningUp.current) {
      console.warn('⚠️ Ignoring signal - connection not ready');
      return;
    }

    try {
      console.log('📨 Handling signal:', data.type);

      if (data.type === 'offer' && data.offer) {
        console.log('📥 Processing offer...');
        
        if (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          hasRemoteDescription.current = true;
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log('✅ Created answer');
          
          SignalingService.sendSignal({ 
            type: 'answer',
            answer: { type: answer.type, sdp: answer.sdp }
          });
          
          await processPendingCandidates();
        }
      }
      else if (data.type === 'answer' && data.answer) {
        console.log('📥 Processing answer...');
        
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          hasRemoteDescription.current = true;
          await processPendingCandidates();
        }
      }
      else if (data.type === 'ice-candidate' && data.candidate) {
        if (hasRemoteDescription.current && pc.signalingState !== 'closed') {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          pendingCandidates.current.push(data.candidate);
        }
      }
    } catch (err) {
      console.error('❌ Error handling signal:', err);
    }
  }, [processPendingCandidates]);

  const initializeWebRTC = useCallback(async (consultationData) => {
    if (isInitializing.current || isCleaningUp.current) {
      console.log('⏭️ Already initializing or cleaning up');
      return;
    }

    if (!roomId || !consultationData) {
      console.log('⏭️ Missing requirements');
      return;
    }
    
    try {
      isInitializing.current = true;
      setLoadingStatus('Requesting camera access...');
      console.log('🚀 Starting WebRTC initialization...');

      // Get user media
      let stream;
      try {
        stream = await requestUserMedia();
        console.log('✅ Got media stream');
        
        // Set up cleanup
        streamCleanupRef.current = () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
        
        setLocalStream(stream);
        
        // Setup local video immediately
        if (localVideoRef.current && stream) {
          setTimeout(() => {
            if (!isCleaningUp.current) {
              setupVideoElement(localVideoRef.current, stream, true);
            }
          }, 100);
        }
        
      } catch (err) {
        console.error('❌ Media access failed:', err);
        setCameraError(err.message);
        setError(err.message);
        setLoading(false);
        return;
      }

      setLoadingStatus('Connecting to signaling server...');

      // Connect to signaling
      try {
        await SignalingService.connect(roomId);
        console.log('✅ Connected to signaling server');
      } catch (err) {
        console.error('❌ Signaling connection failed:', err);
        setError('Cannot connect to signaling server. Please refresh and try again.');
        setLoading(false);
        return;
      }

      setLoadingStatus('Setting up peer connection...');

      // Create peer connection
      const pc = await createPeerConnection(stream);
      SignalingService.onSignal(handleSignal);

      // Role detection
      const currentUserId = auth.currentUser?.uid;
      const doctorId = consultationData?.doctorId;
      const isDoctor = currentUserId === doctorId;
      
      console.log('👤 Role:', isDoctor ? 'Doctor' : 'Patient');

      if (isDoctor) {
        setLoadingStatus('Creating offer...');
        
        // Create offer with proper timing and error handling
        offerTimeoutRef.current = setTimeout(async () => {
          try {
            if (!pc || pc.signalingState === 'closed' || isCleaningUp.current) {
              console.error('❌ Cannot create offer - connection closed');
              return;
            }
            
            console.log('🩺 Creating offer... PC state:', pc.signalingState);
            
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            
            if (pc.signalingState === 'closed' || isCleaningUp.current) {
              console.error('❌ Connection closed during offer creation');
              return;
            }
            
            await pc.setLocalDescription(offer);
            console.log('✅ Created and set offer');
            
            const success = SignalingService.sendSignal({ 
              type: 'offer',
              offer: { type: offer.type, sdp: offer.sdp }
            });
            
            console.log(success ? '📤 Offer sent' : '❌ Failed to send offer');
            
          } catch (err) {
            console.error('❌ Failed to create offer:', err);
            setError('Failed to create connection offer: ' + err.message);
          }
        }, 2000); // Increased delay to ensure everything is ready
        
      } else {
        setLoadingStatus('Waiting for doctor...');
        console.log('🤒 Patient - waiting for offer...');
      }

      // Connection timeout
      initTimeoutRef.current = setTimeout(() => {
        if (!isConnected && !isCleaningUp.current) {
          console.log('⏰ Connection timeout');
          setLoading(false);
          setLoadingStatus('');
          setError('Connection is taking longer than expected. Chat is available below.');
        }
      }, 25000);

    } catch (err) {
      console.error('❌ WebRTC initialization error:', err);
      setError('Failed to initialize video call: ' + err.message);
      setLoading(false);
    } finally {
      isInitializing.current = false;
    }
  }, [roomId, requestUserMedia, setupVideoElement, createPeerConnection, handleSignal, isConnected]);

  // Initialize consultation
  useEffect(() => {
    let isMounted = true;
    let unsubscribeMessages = null;

    const fetchData = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        setLoadingStatus('Loading consultation details...');

        const consultationRef = doc(db, 'consultations', roomId);
        const consultationSnap = await getDoc(consultationRef);

        if (!consultationSnap.exists()) {
          throw new Error('Consultation not found');
        }

        const consultationData = consultationSnap.data();
        if (isMounted) {
          setConsultation(consultationData);
          console.log('✅ Loaded consultation data');
          
          if (!isChatMode) {
            // Small delay to ensure component is ready
            setTimeout(() => {
              if (isMounted && !isCleaningUp.current) {
                initializeWebRTC(consultationData);
              }
            }, 1000);
          } else {
            setLoading(false);
          }
        }

        // Messages listener
        const messagesQuery = query(
          collection(db, 'consultationMessages'),
          where('consultationId', '==', roomId),
          orderBy('timestamp', 'asc')
        );

        unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          if (isMounted) {
            const newMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setMessages(newMessages);
            setTimeout(scrollToBottom, 100);
          }
        });

      } catch (error) {
        console.error('❌ Error fetching consultation:', error);
        if (isMounted) {
          setError('Failed to load consultation: ' + error.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [roomId, isChatMode, initializeWebRTC, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      await addDoc(collection(db, 'consultationMessages'), {
        consultationId: roomId,
        text: newMessage.trim(),
        senderId: auth.currentUser?.uid,
        senderName: auth.currentUser?.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const retryCamera = async () => {
    console.log('🔄 Retrying camera access...');
    setCameraError('');
    setError('');
    setLoading(true);
    
    // Clean up first
    cleanup();
    
    // Wait a bit then retry
    setTimeout(() => {
      if (consultation) {
        initializeWebRTC(consultation);
      }
    }, 1000);
  };

  return (
    <div className={`consultation-room ${isChatMode ? 'chat-mode' : 'video-mode'}`}>
      {error && (
        <div className="error-banner">
          {error}
          {(cameraError || error.includes('camera') || error.includes('Camera')) && (
            <button 
              onClick={retryCamera}
              style={{ 
                marginLeft: '10px', 
                padding: '5px 10px', 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: '4px', 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              Retry
            </button>
          )}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>{loadingStatus}</p>
          <small>Connection state: {connectionState}</small>
        </div>
      ) : (
        <>
          {!isChatMode && (
            <div className="video-container">
              <div className="video-grid">
                <div className="video-wrapper local">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="local-video"
                    style={{ 
                      transform: 'scaleX(-1)',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      background: '#000'
                    }}
                  />
                  <div className="video-label">You</div>
                  {!localStream && (
                    <div className="waiting-overlay">
                      <p>Camera not available</p>
                      <small>{cameraError || 'Camera access failed'}</small>
                      <button 
                        onClick={retryCamera}
                        style={{ 
                          marginTop: '10px',
                          padding: '8px 16px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}
                  {localStream && (
                    <div className="video-controls">
                      <button
                        onClick={toggleVideo}
                        className={`control-button ${!isVideoEnabled ? 'disabled' : ''}`}
                        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                      >
                        {isVideoEnabled ? '🎥' : '🚫'}
                      </button>
                      <button
                        onClick={toggleAudio}
                        className={`control-button ${!isAudioEnabled ? 'disabled' : ''}`}
                        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                      >
                        {isAudioEnabled ? '🎤' : '🔇'}
                      </button>
                    </div>
                  )}
                  <div className="connection-indicator">
                    <span className={`status ${connectionState}`}>
                      {isConnected ? 'Connected' : connectionState}
                    </span>
                  </div>
                </div>
                
                <div className="video-wrapper remote">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      background: '#000'
                    }}
                  />
                  <div className="video-label">
                    {remoteStream ? 'Other Participant' : 'Waiting...'}
                  </div>
                  {!remoteStream && (
                    <div className="waiting-overlay">
                      <p>
                        {connectionState === 'connected' 
                          ? 'Waiting for other participant...' 
                          : 'Connecting...'}
                      </p>
                      <small>Status: {connectionState}</small>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Same device warning */}
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                left: '20px', 
                background: 'rgba(255, 193, 7, 0.9)', 
                color: '#000', 
                padding: '10px 15px', 
                borderRadius: '5px', 
                fontSize: '12px',
                maxWidth: '300px',
                zIndex: 100
              }}>
                <strong>⚠️ Testing Mode</strong><br />
                For best results, test on separate devices or use one tab at a time.
              </div>
            </div>
          )}

          <div className={`chat-container ${isChatMode ? 'full-height' : ''}`}>
            <div className="messages-container">
              {messages.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '20px',
                  fontStyle: 'italic'
                }}>
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.senderId === auth.currentUser?.uid ? 'sent' : 'received'
                  }`}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="timestamp">
                      {message.timestamp?.toDate?.()?.toLocaleTimeString() || 'Sending...'}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConsultationRoom;