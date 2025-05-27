// server/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Get current user profile
router.get('/profile', authenticate, userController.getCurrentUser);

// Sync user data between Firebase Auth and MongoDB
router.post('/sync', authenticate, userController.syncUserData);

// Update user profile
router.patch('/profile', authenticate, userController.updateUserProfile);

// Upload avatar
// Remove the Multer middleware since uploads go directly to Firebase Storage
router.post('/update-avatar', authenticate, userController.updateAvatarUrl);

// Get user's bookmarks
router.get('/bookmarks', authenticate, userController.getUserBookmarks);

// Get user's topics
router.get('/topics', authenticate, userController.getUserTopics);

// Get user's notifications
router.get('/notifications', authenticate, userController.getUserNotifications);

// Mark notification as read
router.patch('/notifications/:notificationId/read', authenticate, userController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/notifications/read-all', authenticate, userController.markAllNotificationsAsRead);

module.exports = router;