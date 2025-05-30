// server/controllers/userController.js
const admin = require('../../config/firebaseAdmin');
const db = admin.firestore();

// Helper: get user doc ref
const userRef = (uid) => db.collection('users').doc(uid);

// Sync user data between Firebase Auth and Firestore
exports.syncUserData = async (req, res) => {
  try {
    const userId = req.user.uid;
    // Get the latest data from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    // Find or create the user in Firestore
    const userDoc = await userRef(userId).get();
    const userData = {
      username: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
      email: userRecord.email,
      avatarUrl: userRecord.photoURL || null,
      lastSeen: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    if (!userDoc.exists) {
      userData.createdAt = admin.firestore.Timestamp.now();
      await userRef(userId).set(userData);
    } else {
      await userRef(userId).update(userData);
    }
    const user = (await userRef(userId).get()).data();
    return res.status(200).json({ success: true, message: 'User data synchronized successfully', user });
  } catch (error) {
    console.error('Error in syncUserData:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userDoc.data();
    // Get counts for additional fields
    const topicsSnap = await db.collection('topics').where('author.uid', '==', userId).get();
    const repliesSnap = await db.collectionGroup('replies').where('author.uid', '==', userId).get();
    user.topicsCount = topicsSnap.size;
    user.repliesCount = repliesSnap.size;
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { username, bio, gender } = req.body;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const updates = { updatedAt: admin.firestore.Timestamp.now() };
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (gender !== undefined) updates.gender = gender;
    await userRef(userId).update(updates);
    // Also update Firebase Auth profile if username is provided
    if (username) {
      await admin.auth().updateUser(userId, { displayName: username });
    }
    const user = (await userRef(userId).get()).data();
    return res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update avatar URL
exports.updateAvatarUrl = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { avatarUrl } = req.body;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await userRef(userId).update({ avatarUrl, updatedAt: admin.firestore.Timestamp.now() });
    await admin.auth().updateUser(userId, { photoURL: avatarUrl });
    return res.status(200).json({ success: true, message: 'Avatar URL updated successfully', avatarUrl });
  } catch (error) {
    console.error('Error updating avatar URL:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user's bookmarks (returns array of topic IDs)
exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userDoc.data();
    const bookmarks = user.bookmarks || [];
    return res.status(200).json({ success: true, bookmarks });
  } catch (error) {
    console.error('Error in getUserBookmarks:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user's topics
exports.getUserTopics = async (req, res) => {
  try {
    const userId = req.user.uid;
    const topicsSnap = await db.collection('topics').where('author.uid', '==', userId).get();
    const topics = [];
    topicsSnap.forEach(doc => topics.push({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, topics });
  } catch (error) {
    console.error('Error in getUserTopics:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userDoc.data();
    const notifications = user.notifications || [];
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { notificationId } = req.params;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userDoc.data();
    let notifications = user.notifications || [];
    notifications = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
    await userRef(userId).update({ notifications });
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await userRef(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userDoc.data();
    let notifications = user.notifications || [];
    notifications = notifications.map(n => ({ ...n, read: true }));
    await userRef(userId).update({ notifications });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};