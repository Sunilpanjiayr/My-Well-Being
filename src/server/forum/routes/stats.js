// server/routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { optionalAuth } = require('../middleware/auth');

// Get forum statistics
router.get('/', optionalAuth, statsController.getForumStats);

module.exports = router;