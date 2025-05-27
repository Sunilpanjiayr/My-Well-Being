// server/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This model supplements Firebase Authentication with additional user data
 * Firebase Auth handles authentication, while this MongoDB model stores
 * additional user data needed for the forum functionality
 */
const UserSchema = new Schema({
  // Firebase UID - used as the primary link between Firebase Auth and our DB
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  avatarUrl: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null],
    default: null
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  bookmarks: [{
    type: Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  notifications: [{
    type: {
      type: String,
      enum: ['reply', 'like', 'bookmark', 'mention', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    sourceId: Schema.Types.ObjectId, // ID of the related content (topic, reply)
    sourceType: {
      type: String,
      enum: ['topic', 'reply']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }]
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Don't expose Firebase UID in JSON
      delete ret.firebaseUid;
      return ret;
    }
  }
});

// Add a virtual for user's topics
UserSchema.virtual('topics', {
  ref: 'Topic',
  localField: 'firebaseUid',
  foreignField: 'author.uid'
});

// Add a virtual for user's replies
UserSchema.virtual('replies', {
  ref: 'Reply',
  localField: 'firebaseUid',
  foreignField: 'author.uid'
});

// Method to mark a notification as read
UserSchema.methods.markNotificationAsRead = function(notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.read = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark all notifications as read
UserSchema.methods.markAllNotificationsAsRead = function() {
  this.notifications.forEach(notification => {
    notification.read = true;
  });
  return this.save();
};

// Method to add a new notification
UserSchema.methods.addNotification = function(type, message, sourceId = null, sourceType = null) {
  this.notifications.unshift({
    type,
    message,
    sourceId,
    sourceType,
    createdAt: Date.now(),
    read: false
  });
  
  // Limit the number of notifications to 100 (optional)
  if (this.notifications.length > 100) {
    this.notifications = this.notifications.slice(0, 100);
  }
  
  return this.save();
};

// Method to add a bookmark
UserSchema.methods.addBookmark = function(topicId) {
  if (!this.bookmarks.includes(topicId)) {
    this.bookmarks.push(topicId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove a bookmark
UserSchema.methods.removeBookmark = function(topicId) {
  const index = this.bookmarks.indexOf(topicId);
  if (index !== -1) {
    this.bookmarks.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to update last seen timestamp
UserSchema.methods.updateLastSeen = function() {
  this.lastSeen = Date.now();
  return this.save();
};

// Static method to find or create a user based on Firebase Auth data
UserSchema.statics.findOrCreateFromFirebase = async function(firebaseUser) {
  try {
    // Check if user already exists
    let user = await this.findOne({ firebaseUid: firebaseUser.uid });
    
    if (!user) {
      // Create a new user with Firebase data
      user = new this({
        firebaseUid: firebaseUser.uid,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        avatarUrl: firebaseUser.photoURL || null
      });
      
      await user.save();
    }
    
    // Update lastSeen
    user.lastSeen = Date.now();
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);