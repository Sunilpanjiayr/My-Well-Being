const http = require('http');

// Function to check if server is running
function checkServer(port = 3001) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const healthData = JSON.parse(data);
          resolve({
            running: true,
            status: healthData.status,
            connections: healthData.server?.connections,
            rooms: healthData.rooms?.total || 0,
            uptime: healthData.server?.uptime
          });
        } catch (e) {
          resolve({
            running: true,
            status: 'unknown',
            error: 'Invalid response format'
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        running: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        running: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// Function to check if port is in use
function checkPort(port = 3001) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve({ available: true });
      });
      server.close();
    });
    
    server.on('error', (err) => {
      resolve({ 
        available: false, 
        error: err.code === 'EADDRINUSE' ? 'Port is already in use' : err.message 
      });
    });
  });
}

// Main check function
async function runDiagnostics() {
  console.log('🔍 Running signaling server diagnostics...\n');

  // Check if port is available
  console.log('📍 Checking port 3001 availability...');
  const portStatus = await checkPort(3001);
  
  if (portStatus.available) {
    console.log('❌ Port 3001 is available (server not running)');
    console.log('\n💡 To start the signaling server:');
    console.log('   1. Open a new terminal');
    console.log('   2. Navigate to your project directory');
    console.log('   3. Run: node server.js');
    console.log('   4. You should see: "🚀 Signaling server running on http://localhost:3001"');
    return;
  } else {
    console.log('✅ Port 3001 is in use');
  }

  // Check if server is responding
  console.log('\n🏥 Checking server health...');
  const serverStatus = await checkServer(3001);
  
  if (serverStatus.running) {
    console.log('✅ Signaling server is running and responding');
    console.log(`   Status: ${serverStatus.status}`);
    console.log(`   Connections: ${serverStatus.connections || 0}`);
    console.log(`   Active rooms: ${serverStatus.rooms || 0}`);
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime || 0)} seconds`);
    
    // Test WebSocket connection
    console.log('\n🔌 Testing WebSocket connection...');
    testWebSocketConnection();
  } else {
    console.log('❌ Server is not responding');
    console.log(`   Error: ${serverStatus.error}`);
    console.log('\n💡 Server might be running but not configured correctly.');
    console.log('   Check if server.js has the correct health endpoint.');
  }
}

// Test WebSocket connection
function testWebSocketConnection() {
  try {
    const { io } = require('socket.io-client');
    
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      timeout: 5000,
      query: {
        roomId: 'test-room',
        userId: 'test-user'
      }
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connection successful');
      socket.disconnect();
    });

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection failed');
      console.log(`   Error: ${error.message}`);
    });

    socket.on('connection_success', (data) => {
      console.log('✅ Server acknowledged connection');
    });

    setTimeout(() => {
      if (!socket.connected) {
        console.log('⏱️ WebSocket connection timeout');
        socket.disconnect();
      }
    }, 5000);

  } catch (error) {
    console.log('❌ Cannot test WebSocket (socket.io-client not installed?)');
    console.log('   Run: npm install socket.io-client');
  }
}

// Common issues and solutions
function showTroubleshootingGuide() {
  console.log('\n📋 Common Issues and Solutions:');
  console.log('\n1. Port already in use:');
  console.log('   - Stop other processes using port 3001');
  console.log('   - Or change the port in both server.js and SignalingService.js');
  
  console.log('\n2. Permission denied:');
  console.log('   - Run with sudo (Linux/Mac): sudo node server.js');
  console.log('   - Or use a port > 1024');
  
  console.log('\n3. Module not found:');
  console.log('   - Run: npm install express socket.io cors');
  
  console.log('\n4. Firewall blocking:');
  console.log('   - Allow port 3001 in your firewall settings');
  console.log('   - Check antivirus software blocking connections');
  
  console.log('\n5. Browser issues:');
  console.log('   - Try in different browser');
  console.log('   - Clear browser cache and cookies');
  console.log('   - Check browser console for CORS errors');
}

// Run diagnostics
if (require.main === module) {
  runDiagnostics().then(() => {
    showTroubleshootingGuide();
    process.exit(0);
  });
}

module.exports = { checkServer, checkPort, runDiagnostics };