// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Test authentication endpoint
router.get('/test', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.userData?.displayName,
      emailVerified: req.user.email_verified
    }
  });
});

// Verify if token is valid
router.get('/verify', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

module.exports = router;