const Reply = require('../models/Reply');
const Topic = require('../models/Topic');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createReply = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content, parentReplyId, attachments } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    if (parentReplyId && !mongoose.Types.ObjectId.isValid(parentReplyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid parent reply ID' 
      });
    }
    
    if (parentReplyId) {
      const parentReply = await Reply.findById(parentReplyId);
      if (!parentReply) {
        return res.status(404).json({ 
          success: false, 
          message: 'Parent reply not found' 
        });
      }
      
      if (parentReply.topicId.toString() !== topicId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Parent reply does not belong to this topic' 
        });
      }
    }
    
    const topic = await Topic.findById(topicId);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    if (topic.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'This topic is locked. New replies are not allowed.' 
      });
    }
    
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const displayName = req.user.name || req.userData?.displayName || userEmail.split('@')[0];
    const photoURL = req.user.picture || req.userData?.photoURL;
    
    let userDoc = await User.findOne({ firebaseUid: userId });
    
    if (!userDoc) {
      userDoc = await User.findOrCreateFromFirebase({
        uid: userId,
        email: userEmail,
        displayName,
        photoURL
      });
    }
    
    const newReply = new Reply({
      content: content.trim(),
      topicId,
      parentReplyId: parentReplyId || null,
      attachments: attachments || [],
      author: {
        uid: userId,
        username: userDoc.username || displayName,
        avatarUrl: userDoc.avatarUrl || photoURL,
        joinDate: userDoc.createdAt
      }
    });
    
    await newReply.save();
    
    topic.replyCount += 1;
    await topic.save();
    
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
      }
    }
    
    if (parentReplyId && parentReplyId !== null) {
      try {
        const parentReply = await Reply.findById(parentReplyId);
        if (parentReply && parentReply.author.uid !== userId) {
          const parentAuthorDoc = await User.findOne({ firebaseUid: parentReply.author.uid });
          
          if (parentAuthorDoc) {
            const replierName = userDoc.username || displayName;
            await parentAuthorDoc.addNotification(
              'reply', 
              `${replierName} replied to your comment in "${topic.title}"`,
              topic._id,
              'reply'
            );
          }
        }
      } catch (notifError) {
        console.error('Error creating nested reply notification:', notifError);
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

exports.updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    if (reply.author.uid !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this reply' 
      });
    }
    
    const topic = await Topic.findById(reply.topicId);
    
    if (topic && topic.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'This topic is locked. Replies cannot be updated.' 
      });
    }
    
    reply.content = content.trim();
    
    if (attachments) {
      reply.attachments = attachments;
    }
    
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

exports.deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    if (reply.author.uid !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this reply' 
      });
    }
    
    const childReplies = await Reply.find({ parentReplyId: id });
    
    for (const childReply of childReplies) {
      childReply.parentReplyId = reply.parentReplyId; // Set to the parent of the deleted reply
      await childReply.save();
    }
    
    const topic = await Topic.findById(reply.topicId);
    if (topic) {
      topic.replyCount = Math.max(0, topic.replyCount - 1);
      await topic.save();
    }
    
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

exports.likeReply = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
    await reply.toggleLike(req.user.uid);
    
    const isLiked = reply.isLikedByUser(req.user.uid);
    
    if (isLiked && reply.author.uid !== req.user.uid) {
      try {
        const authorDoc = await User.findOne({ firebaseUid: reply.author.uid });
        
        if (authorDoc) {
          const likerName = req.userData?.displayName || req.user.email.split('@')[0];
          
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

exports.reportReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reply ID' 
      });
    }
    
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'A reason for the report is required' 
      });
    }
    
    const reply = await Reply.findById(id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }
    
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
