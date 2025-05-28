const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true
  },
  parentReplyId: {
    type: Schema.Types.ObjectId,
    ref: 'Reply',
    default: null
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
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String, // 'image' or 'pdf'
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // User UIDs who have liked this reply
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

ReplySchema.methods.toggleLike = function(userId) {
  const index = this.likedBy.indexOf(userId);

  if (index === -1) {
    this.likedBy.push(userId);
    this.likes += 1;
  } else {
    this.likedBy.splice(index, 1);
    this.likes -= 1;
  }

  return this.save();
};

ReplySchema.methods.isLikedByUser = function(userId) {
  return this.likedBy.includes(userId);
};

ReplySchema.methods.report = function(userId, reason) {
  const existingReport = this.reports.find(report => report.userId === userId);

  if (existingReport) {
    existingReport.reason = reason;
    existingReport.createdAt = Date.now();
    existingReport.resolved = false;
  } else {
    this.reports.push({
      userId,
      reason,
      createdAt: Date.now(),
      resolved: false
    });
  }

  return this.save();
};

module.exports = mongoose.model('Reply', ReplySchema);
