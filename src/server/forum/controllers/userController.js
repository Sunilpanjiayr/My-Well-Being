// server/controllers/userController.js
const User = require('../models/User');
const Topic = require('../models/Topic');
const Reply = require('../models/Reply');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

// Sync user data between Firebase Auth and MongoDB
exports.syncUserData = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get the latest data from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    
    // Find or create the user in MongoDB
    let user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      // Create a new user if they don't exist in MongoDB
      user = new User({
        firebaseUid: userId,
        username: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
        email: userRecord.email,
        avatarUrl: userRecord.photoURL
      });
    } else {
      // Update existing user with latest Firebase data
      user.username = userRecord.displayName || user.username;
      user.email = userRecord.email || user.email;
      user.avatarUrl = userRecord.photoURL || user.avatarUrl;
    }
    
    // Update the lastSeen timestamp
    user.lastSeen = Date.now();
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'User data synchronized successfully',
      user
    });
  } catch (error) {
    console.error('Error in syncUserData:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Find the user in MongoDB
    let user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      // Create a new user if they don't exist in MongoDB
      const userRecord = await admin.auth().getUser(userId);
      
      user = await User.findOrCreateFromFirebase({
        uid: userId,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      });
    }
    
    // Get counts for additional fields
    const topicsCount = await Topic.countDocuments({ 'author.uid': userId });
    const repliesCount = await Reply.countDocuments({ 'author.uid': userId });
    
    // Create response object with additional counts
    const userProfile = user.toJSON();
    userProfile.topicsCount = topicsCount;
    userProfile.repliesCount = repliesCount;
    
    return res.status(200).json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { username, bio, gender } = req.body;
    
    // Find the user in MongoDB
    let user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if username is being changed and make sure it's unique
    if (username && username !== user.username) {
      // Check if username already exists
      const existingUser = await User.findOne({ username: username });
      
      if (existingUser && existingUser.firebaseUid !== userId) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken'
        });
      }
      
      user.username = username;
    }
    
    // Update other fields if provided
    if (bio !== undefined) user.bio = bio;
    if (gender !== undefined) user.gender = gender;
    
    await user.save();
    
    // Also update Firebase Auth profile if username is provided
    if (username) {
      await admin.auth().updateUser(userId, {
        displayName: username
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// New function needed
exports.updateAvatarUrl = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { avatarUrl } = req.body;
    
    // Update user in MongoDB with the URL from Firebase Storage
    let user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.avatarUrl = avatarUrl;
    await user.save();
    
    // Update Firebase Auth profile
    await admin.auth().updateUser(userId, { photoURL: avatarUrl });
    
    return res.status(200).json({
      success: true,
      message: 'Avatar URL updated successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Error updating avatar URL:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's bookmarks
exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Find the user in MongoDB
    let user = await User.findOne({ firebaseUid: userId }).populate('bookmarks');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If no bookmarks array is populated, fetch from topics collection
    if (!user.bookmarks || user.bookmarks.length === 0) {
      const bookmarkedTopics = await Topic.find({ bookmarkedBy: userId }).select('_id');
      user.bookmarks = bookmarkedTopics.map(topic => topic._id);
      await user.save();
    }
    
    // Return just the IDs if no details are requested
    if (req.query.idsOnly === 'true') {
      return res.status(200).json(user.bookmarks.map(bookmark => 
        bookmark._id ? bookmark._id.toString() : bookmark.toString()
      ));
    }
    
    // Populate full bookmark data if not already populated
    if (typeof user.bookmarks[0] === 'string' || user.bookmarks[0] instanceof mongoose.Types.ObjectId) {
      user = await User.findOne({ firebaseUid: userId }).populate({
        path: 'bookmarks',
        options: { sort: { createdAt: -1 } }
      });
    }
    
    return res.status(200).json(user.bookmarks);
  } catch (error) {
    console.error('Error in getUserBookmarks:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's topics
exports.getUserTopics = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get topics created by the user
    const topics = await Topic.find({ 'author.uid': userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json(topics);
  } catch (error) {
    console.error('Error in getUserTopics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Find the user in MongoDB
    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get unread notification count
    const unreadCount = user.notifications.filter(notification => !notification.read).length;
    
    return res.status(200).json({
      success: true,
      notifications: user.notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { notificationId } = req.params;
    
    // Find the user in MongoDB
    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find the notification
    const notification = user.notifications.id(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Mark as read
    notification.read = true;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Find the user in MongoDB
    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mark all as read
    user.notifications.forEach(notification => {
      notification.read = true;
    });
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};