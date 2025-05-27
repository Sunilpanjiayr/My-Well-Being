// server/models/Topic.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TopicSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'nutrition', 'fitness', 'mental', 'chronic', 'wellness', 'success'],
    default: 'general'
  },
  author: {
    uid: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatarUrl: String,
    joinDate: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  likedBy: [{
    type: String // User UIDs who have liked this topic
  }],
  bookmarkedBy: [{
    type: String // User UIDs who have bookmarked this topic
  }],
  reports: [{
    userId: String,
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, { 
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for replies - populated when needed
TopicSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'topicId'
});

// Add text index for search
TopicSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Increment view count
TopicSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Toggle like status for a user
TopicSchema.methods.toggleLike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index === -1) {
    // User hasn't liked this topic yet, add like
    this.likedBy.push(userId);
    this.likes += 1;
  } else {
    // User already liked this topic, remove like
    this.likedBy.splice(index, 1);
    this.likes -= 1;
  }
  
  return this.save();
};

// Check if a user has liked this topic
TopicSchema.methods.isLikedByUser = function(userId) {
  return this.likedBy.includes(userId);
};

// Toggle bookmark status for a user
TopicSchema.methods.toggleBookmark = function(userId) {
  const index = this.bookmarkedBy.indexOf(userId);
  
  if (index === -1) {
    // User hasn't bookmarked this topic yet, add bookmark
    this.bookmarkedBy.push(userId);
    return [this.save(), true]; // [saved doc, isNowBookmarked]
  } else {
    // User already bookmarked this topic, remove bookmark
    this.bookmarkedBy.splice(index, 1);
    return [this.save(), false]; // [saved doc, isNowBookmarked]
  }
};

// Check if a user has bookmarked this topic
TopicSchema.methods.isBookmarkedByUser = function(userId) {
  return this.bookmarkedBy.includes(userId);
};

// Report a topic
TopicSchema.methods.report = function(userId, reason) {
  // Check if the user has already reported this topic
  const existingReport = this.reports.find(report => report.userId === userId);
  
  if (existingReport) {
    // Update the existing report
    existingReport.reason = reason;
    existingReport.createdAt = Date.now();
    existingReport.resolved = false;
  } else {
    // Add a new report
    this.reports.push({
      userId,
      reason,
      createdAt: Date.now(),
      resolved: false
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Topic', TopicSchema);