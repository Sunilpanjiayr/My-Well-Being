import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import Peer from 'peerjs';
import io from 'socket.io-client';
import './ConsultationRoom.css';
import './file-upload.css';

const ConsultationRoom = () => {
  const { roomId } = useParams();
  
  // Simplified state
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const callRef = useRef(null);
  
  // Simple initialization flag
  const initialized = useRef(false);

  console.log('🎯 Simple state:', { loading, status, hasVideo, isConnected });

  // Initialize everything in one simple effect
  useEffect(() => {
    if (!roomId || initialized.current) return;
    
    console.log('🚀 Starting simple initialization for room:', roomId);
    initialized.current = true;

    const initializeAll = async () => {
      try {
        // 1. Setup chat first (this always works)
        setupChat();
        
        // 2. Setup video (optional)
        await setupVideo();
        
      } catch (error) {
        console.error('❌ Initialization error:', error);
        setError(error.message);
      }
    };

    initializeAll();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up...');
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (callRef.current) {
        callRef.current.close();
      }
      
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const setupChat = () => {
    console.log('💬 Setting up chat...');
    
    try {
      // Simple messages listener - no complex consultation loading
      const messagesQuery = query(
        collection(db, 'consultationMessages'),
        where('consultationId', '==', roomId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, 
        (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          setMessages(newMessages);
          
          // Scroll to bottom
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        },
        (error) => {
          console.warn('⚠️ Firestore error (continuing anyway):', error);
        }
      );

      console.log('✅ Chat setup complete');
      return unsubscribe;
      
    } catch (error) {
      console.warn('⚠️ Chat setup failed (continuing anyway):', error);
    }
  };

  const setupVideo = async () => {
    console.log('🎥 Setting up video...');
    setLoading(true);
    setStatus('Setting up video...');

    try {
      // 1. Check server
      setStatus('Checking server...');
      const healthResponse = await fetch('http://localhost:3001/health');
      if (!healthResponse.ok) {
        throw new Error('Server not running. Please start: node server.js');
      }
      console.log('✅ Server is healthy');

      // 2. Get media
      setStatus('Getting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      
      console.log('✅ Media obtained');
      setLocalStream(stream);
      setHasVideo(true);
      
      // Setup local video immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        console.log('📺 Local video set');
      }

      // 3. Setup WebRTC
      setStatus('Setting up connection...');
      await setupWebRTC(stream);

      setStatus('Ready for connection');
      setLoading(false);

    } catch (error) {
      console.error('❌ Video setup failed:', error);
      setError(`Video failed: ${error.message}`);
      setLoading(false);
      setStatus('Video unavailable - Chat only');
    }
  };

  const setupWebRTC = async (stream) => {
    return new Promise((resolve, reject) => {
      try {
        // Setup Socket.IO
        const socket = io('http://localhost:3001', {
          transports: ['polling', 'websocket'],
          timeout: 10000
        });
        
        socketRef.current = socket;

        // Setup PeerJS
        const peer = new Peer(undefined, {
          config: {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          }
        });
        
        peerRef.current = peer;

        // Socket events
        socket.on('connect', () => {
          console.log('✅ Socket connected');
        });

        socket.on('user-connected', (userId) => {
          console.log('👤 User connected:', userId);
          if (peer.id !== userId) {
            makeCall(userId, stream);
          }
        });

        socket.on('user-disconnected', (userId) => {
          console.log('👤 User disconnected:', userId);
          if (callRef.current) {
            callRef.current.close();
          }
          setIsConnected(false);
          setRemoteStream(null);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        });

        // Peer events
        peer.on('open', (id) => {
          console.log('🔑 Peer ID:', id);
          socket.emit('join-room', roomId, id);
        });

        peer.on('call', (call) => {
          console.log('📞 Incoming call');
          call.answer(stream);
          callRef.current = call;

          call.on('stream', (remoteStream) => {
            console.log('📹 Remote stream received');
            setRemoteStream(remoteStream);
            setIsConnected(true);
            
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });

        // Resolve after peer is ready
        peer.on('open', () => {
          console.log('✅ WebRTC setup complete');
          resolve();
        });

        peer.on('error', (err) => {
          console.error('❌ Peer error:', err);
          reject(err);
        });

        socket.on('connect_error', (err) => {
          console.error('❌ Socket error:', err);
          reject(err);
        });

        // Timeout
        setTimeout(() => {
          resolve(); // Don't fail, just continue
        }, 15000);

      } catch (error) {
        reject(error);
      }
    });
  };

  const makeCall = (userId, stream) => {
    console.log('📞 Making call to:', userId);
    const call = peerRef.current.call(userId, stream);
    callRef.current = call;

    call.on('stream', (remoteStream) => {
      console.log('📹 Remote stream from outgoing call');
      setRemoteStream(remoteStream);
      setIsConnected(true);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    call.on('close', () => {
      console.log('📞 Call ended');
      setIsConnected(false);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      await addDoc(collection(db, 'consultationMessages'), {
        consultationId: roomId,
        text: newMessage.trim(),
        senderId: auth.currentUser?.uid || 'anonymous',
        senderName: auth.currentUser?.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Don't show error, just continue
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Error Banner */}
      {error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#dc3545',
          color: 'white',
          padding: '10px 20px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Video Section */}
      {hasVideo && (
        <div style={{ 
          flex: 1, 
          background: '#000', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2px' 
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
                transform: 'scaleX(-1)' 
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              You
            </div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              display: 'flex',
              gap: '5px'
            }}>
              <button 
                onClick={toggleVideo}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🎥
              </button>
              <button 
                onClick={toggleAudio}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🎤
              </button>
            </div>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: isConnected ? 'green' : 'orange',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              textTransform: 'uppercase'
            }}>
              {isConnected ? 'Connected' : status}
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
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              {remoteStream ? 'Other Participant' : 'Waiting...'}
            </div>
            {!remoteStream && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
                <div>Waiting for other participant</div>
                <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                  Share this room URL with them
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
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
          <div>{status}</div>
        </div>
      )}

      {/* Chat Section */}
      <div style={{ 
        width: hasVideo ? '350px' : '100%',
        display: 'flex', 
        flexDirection: 'column',
        background: 'white',
        borderLeft: hasVideo ? '1px solid #ddd' : 'none'
      }}>
        {/* Messages */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto' 
        }}>
          {messages.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              fontStyle: 'italic',
              padding: '20px'
            }}>
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: '15px',
                textAlign: message.senderId === auth.currentUser?.uid ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: message.senderId === auth.currentUser?.uid ? '#007bff' : '#f1f1f1',
                  color: message.senderId === auth.currentUser?.uid ? 'white' : '#333',
                  wordWrap: 'break-word'
                }}
              >
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  {message.text}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  opacity: 0.7, 
                  marginTop: '5px' 
                }}>
                  {message.timestamp?.toDate?.()?.toLocaleTimeString() || 'Sending...'}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            style={{
              padding: '12px 20px',
              background: newMessage.trim() ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConsultationRoom;