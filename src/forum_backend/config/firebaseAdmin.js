// src/forum_backend/config/firebaseAdmin.js
const admin = require('firebase-admin');

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const getServiceAccount = () => {
  console.log('🔧 Loading Firebase service account configuration...');
  
  // Try environment variable first (works for both local and production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      console.log('✅ Using Firebase service account from environment variable');
      console.log('📋 Project ID:', serviceAccount.project_id);
      return serviceAccount;
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
      throw new Error('Invalid Firebase service account JSON in environment variable');
    }
  }
  
  // Fallback to file for local development
  if (process.env.NODE_ENV === 'development') {
    try {
      const serviceAccount = require('./firebase-service-account.json');
      console.log('⚠️ Using Firebase service account from file (development only)');
      console.log('📋 Project ID:', serviceAccount.project_id);
      return serviceAccount;
    } catch (error) {
      console.error('❌ Could not load service account from file:', error.message);
    }
  }
  
  throw new Error(`
❌ No Firebase service account configuration found!
   
For local development:
- Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable, OR
- Place firebase-service-account.json in the config directory

For production:
- Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable in Railway
  `);
};

// Check if Firebase is already initialized (avoid conflicts with video consultation)
let firebaseAdmin;

if (admin.apps.length > 0) {
  console.log('✅ Firebase Admin already initialized (using existing instance)');
  firebaseAdmin = admin;
} else {
  try {
    console.log('🚀 Initializing Firebase Admin for forum...');
    const serviceAccount = getServiceAccount();
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
    });
    
    console.log('🎉 Firebase Admin initialized successfully for forum!');
    console.log('🏗️ Environment:', process.env.NODE_ENV || 'development');
    
    // Test connection
    admin.firestore().collection('_test').limit(1).get()
      .then(() => console.log('✅ Firestore connection verified'))
      .catch(error => console.error('❌ Firestore connection failed:', error.message));
    
  } catch (error) {
    console.error('💥 Firebase Admin initialization failed:', error.message);
    throw error;
  }
}

module.exports = firebaseAdmin;