import React, { useEffect, useRef, useState } from 'react';

const JitsiTest = () => {
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Loading Jitsi...');

  useEffect(() => {
    const loadJitsiAndConnect = async () => {
      try {
        console.log('🧪 Testing Jitsi Meet integration...');
        setStatus('Loading Jitsi Meet API...');
        
        // Load Jitsi Meet API
        if (!window.JitsiMeetExternalAPI) {
          console.log('📦 Loading Jitsi Meet API...');
          await loadJitsiScript();
        }

        setStatus('Connecting to test room...');

        // Create Jitsi Meet instance
        const testRoomName = `test-room-${Date.now()}`;
        
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: testRoomName,
          width: '100%',
          height: '500px',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            APP_NAME: 'Medical Consultation Test',
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'hangup', 'settings'
            ]
          },
          userInfo: {
            displayName: 'Test User'
          }
        });

        // Set up event listeners
        api.addEventListener('videoConferenceJoined', () => {
          console.log('✅ Successfully joined test room');
          setStatus('Connected to test room');
          setLoading(false);
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('👋 Left test room');
          setStatus('Test ended');
        });

        api.addEventListener('errorOccurred', (event) => {
          console.error('❌ Jitsi error:', event);
          setError(`Jitsi error: ${event.error?.message || 'Unknown error'}`);
          setLoading(false);
        });

        setJitsiApi(api);
        
      } catch (error) {
        console.error('❌ Failed to load Jitsi:', error);
        setError(`Failed to load Jitsi: ${error.message}`);
        setLoading(false);
      }
    };

    loadJitsiAndConnect();

    // Cleanup
    return () => {
      if (jitsiApi) {
        try {
          jitsiApi.dispose();
        } catch (e) {
          console.warn('Error disposing Jitsi:', e);
        }
      }
    };
  }, []);

  const loadJitsiScript = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector('script[src*="external_api.js"]')) {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Jitsi Meet API loaded');
        // Wait for API to be available
        setTimeout(() => {
          if (window.JitsiMeetExternalAPI) {
            resolve();
          } else {
            reject(new Error('Jitsi API not available'));
          }
        }, 1000);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Jitsi Meet API'));
      };
      
      document.head.appendChild(script);
    });
  };

  const endCall = () => {
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
      setStatus('Test ended');
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2>🧪 Jitsi Meet Integration Test</h2>
        <p>This page tests if Jitsi Meet loads properly in your application.</p>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Status:</strong> <span style={{ color: error ? '#dc3545' : '#007bff' }}>
            {error || status}
          </span>
        </div>
        
        {loading && !error && (
          <div style={{ color: '#007bff', marginTop: '10px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid rgba(0,123,255,0.3)',
              borderTop: '3px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '10px auto'
            }}></div>
            <div>⏳ {status}</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              This may take a few seconds...
            </div>
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: '#dc3545', 
            background: '#f8d7da', 
            padding: '15px', 
            borderRadius: '5px',
            marginTop: '10px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>❌ Error:</strong><br />
            {error}
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Troubleshooting:</strong>
              <ul style={{ textAlign: 'left', marginTop: '5px' }}>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Allow camera/microphone permissions</li>
                <li>Check browser console for more details</li>
              </ul>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <div style={{ color: '#28a745', marginTop: '10px' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              ✅ Jitsi Meet loaded successfully!
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={endCall}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📞 End Test Call
              </button>
              <button 
                onClick={goBack}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jitsi Meet Container */}
      <div style={{ 
        border: '2px solid #e0e0e0', 
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#000',
        minHeight: '500px'
      }}>
        <div 
          ref={jitsiContainerRef}
          style={{ 
            width: '100%', 
            height: '500px',
            minHeight: '500px'
          }}
        />
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <strong>🔍 What this test does:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Loads the Jitsi Meet External API from meet.jit.si</li>
          <li>Creates a test room with basic video conferencing features</li>
          <li>Tests camera and microphone access (you may need to allow permissions)</li>
          <li>Verifies that the integration works without any server setup</li>
        </ul>
        
        <div style={{ marginTop: '15px' }}>
          <strong>✅ If successful:</strong> You should see a video conference interface with your camera feed.
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <strong>❌ If failed:</strong> Check the browser console for errors and ensure you have internet access.
        </div>
      </div>

      {/* CSS for spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JitsiTest;