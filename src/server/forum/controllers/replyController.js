// server/controllers/replyController.js
const Reply = require('../models/Reply');
const Topic = require('../models/Topic');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new reply to a topic
exports.createReply = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(topicId);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Check if the topic is locked
    if (topic.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'This topic is locked. New replies are not allowed.' 
      });
    }
    
    // Get user data from Firebase Auth
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const displayName = req.user.name || req.userData?.displayName || userEmail.split('@')[0];
    const photoURL = req.user.picture || req.userData?.photoURL;
    
    // Check if we have a MongoDB User document for this Firebase user
    let userDoc = await User.findOne({ firebaseUid: userId });
    
    if (!userDoc) {
      // Create a new user document if it doesn't exist
      userDoc = await User.findOrCreateFromFirebase({
        uid: userId,
        email: userEmail,
        displayName,
        photoURL
      });
    }
    
    // Create the new reply
    const newReply = new Reply({
      content,
      topicId,
      author: {
        uid: userId,
        username: userDoc.username || displayName,
        avatarUrl: userDoc.avatarUrl || photoURL,
        joinDate: userDoc.createdAt
      }
    });
    
    await newReply.save();
    
    // Increment reply count on the topic
    topic.replyCount += 1;
    await topic.save();
    
    // Create a notification for the topic author if the reply is from someone else
    if (topic.author.uid !== userId) {
      try {
        const authorDoc = await User.findOne({ firebaseUid: topic.author.uid });
        
        if (authorDoc) {
          const replierName = userDoc.username || displayName;
          await authorDoc.addNotification(
            'reply', 
            `${replierName} replied to your topic "${topic.title}"`,
            topic._id,
            'topic'
          );
        }
      } catch (notifError) {
        console.error('Error creating reply notification:', notifError);
        // Continue execution even if notification fails
      }
    }
    
    return res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Error in createReply:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a reply
exports.updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    // Find the reply
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    // Check if the user is the author
    if (reply.author.uid !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this reply' 
      });
    }
    
    // Find the topic to check if it's locked
    const topic = await Topic.findById(reply.topicId);
    
    if (topic && topic.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'This topic is locked. Replies cannot be updated.' 
      });
    }
    
    // Update the reply
    reply.content = content;
    await reply.save();
    
    return res.status(200).json({
      success: true,
      message: 'Reply updated successfully',
      reply
    });
  } catch (error) {
    console.error('Error in updateReply:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    // Find the reply
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    // Check if the user is the author or an admin
    if (reply.author.uid !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this reply' 
      });
    }
    
    // Decrement reply count on the topic
    const topic = await Topic.findById(reply.topicId);
    if (topic) {
      topic.replyCount = Math.max(0, topic.replyCount - 1);
      await topic.save();
    }
    
    // Delete the reply
    await Reply.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteReply:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Like or unlike a reply
exports.likeReply = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    // Find the reply
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    // Toggle like status
    await reply.toggleLike(req.user.uid);
    
    // Check if the reply is now liked by the user
    const isLiked = reply.isLikedByUser(req.user.uid);
    
    // If it's a new like (not an unlike), create a notification for the reply author
    if (isLiked && reply.author.uid !== req.user.uid) {
      try {
        const authorDoc = await User.findOne({ firebaseUid: reply.author.uid });
        
        if (authorDoc) {
          const likerName = req.userData?.displayName || req.user.email.split('@')[0];
          
          // Get the topic title for context
          const topic = await Topic.findById(reply.topicId);
          const topicTitle = topic ? topic.title : 'a topic';
          
          await authorDoc.addNotification(
            'like', 
            `${likerName} liked your reply in "${topicTitle}"`,
            reply._id,
            'reply'
          );
        }
      } catch (notifError) {
        console.error('Error creating like notification:', notifError);
        // Continue execution even if notification fails
      }
    }
    
    return res.status(200).json({
      success: true,
      message: isLiked ? 'Reply liked successfully' : 'Reply unliked successfully',
      likes: reply.likes,
      isLiked
    });
  } catch (error) {
    console.error('Error in likeReply:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Report a reply
exports.reportReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    // Validate reason
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'A reason for the report is required' 
      });
    }
    
    // Find the reply
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    // Add the report
    await reply.report(req.user.uid, reason);
    
    return res.status(200).json({
      success: true,
      message: 'Reply reported successfully'
    });
  } catch (error) {
    console.error('Error in reportReply:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};