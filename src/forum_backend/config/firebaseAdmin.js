// src/forum_backend/config/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // Optionally, add databaseURL if you use Realtime Database
  });
}

module.exports = admin;