// server/controllers/topicController.js
const Topic = require('../models/Topic');
const Reply = require('../models/Reply');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all topics with filtering options
exports.getTopics = async (req, res) => {
  try {
    const { category, search, sort, view, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Filter by category if provided
    if (category) {
      filter.category = category;
    }
    
    // Filter by search query if provided
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Filter by view type (bookmarks or user's topics)
    if (view === 'bookmarks' && req.user) {
      filter.bookmarkedBy = req.user.uid;
    } else if (view === 'myTopics' && req.user) {
      filter['author.uid'] = req.user.uid;
    }
    
    // Build sort object
    let sortObj = {};
    
    switch (sort) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortObj = { likes: -1, createdAt: -1 };
        break;
      case 'mostViewed':
        sortObj = { views: -1, createdAt: -1 };
        break;
      case 'mostReplies':
        sortObj = { replyCount: -1, createdAt: -1 };
        break;
      default:
        // Default sorting: pinned topics first, then newest
        sortObj = { isPinned: -1, createdAt: -1 };
    }
    
    // Execute the query
    const topics = await Topic.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Count total topics for pagination
    const total = await Topic.countDocuments(filter);
    
    // If user is authenticated, check which topics they've liked and bookmarked
    if (req.user) {
      const userId = req.user.uid;
      
      topics.forEach(topic => {
        topic.isLiked = topic.likedBy && topic.likedBy.includes(userId);
        topic.isBookmarked = topic.bookmarkedBy && topic.bookmarkedBy.includes(userId);
        
        // Remove the arrays from the response for privacy
        delete topic.likedBy;
        delete topic.bookmarkedBy;
      });
    }
    
    return res.status(200).json(topics);
  } catch (error) {
    console.error('Error in getTopics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single topic with its replies
exports.getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(id)
      .populate({
        path: 'replies',
        options: { sort: { createdAt: 1 } }
      });
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Increment view count if the user is not the author
    if (!req.user || req.user.uid !== topic.author.uid) {
      topic.views += 1;
      await topic.save();
    }
    
    // Convert to a plain object we can modify
    const topicObj = topic.toObject();
    
    // If user is authenticated, check likes and bookmarks
    if (req.user) {
      const userId = req.user.uid;
      
      // Check if user has liked or bookmarked this topic
      topicObj.isLiked = topic.likedBy.includes(userId);
      topicObj.isBookmarked = topic.bookmarkedBy.includes(userId);
      
      // Check likes on replies
      if (topicObj.replies && topicObj.replies.length > 0) {
        topicObj.replies.forEach(reply => {
          reply.isLiked = reply.likedBy && reply.likedBy.includes(userId);
          
          // Remove the array from the response for privacy
          delete reply.likedBy;
        });
      }
    }
    
    // Remove the arrays from the response for privacy
    delete topicObj.likedBy;
    delete topicObj.bookmarkedBy;
    
    return res.status(200).json(topicObj);
  } catch (error) {
    console.error('Error in getTopic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
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
    
    // Create the new topic
    const newTopic = new Topic({
      title,
      content,
      category: category || 'general',
      author: {
        uid: userId,
        username: userDoc.username || displayName,
        avatarUrl: userDoc.avatarUrl || photoURL,
        joinDate: userDoc.createdAt
      },
      tags: tags || []
    });
    
    await newTopic.save();
    
    return res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      topic: newTopic
    });
  } catch (error) {
    console.error('Error in createTopic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(id);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Check if the user is the author
    if (topic.author.uid !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this topic' 
      });
    }
    
    // Update the topic
    if (title) topic.title = title;
    if (content) topic.content = content;
    if (category) topic.category = category;
    if (tags) topic.tags = tags;
    
    await topic.save();
    
    return res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      topic
    });
  } catch (error) {
    console.error('Error in updateTopic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};
// Add this to your topicController.js file
exports.createReply = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    // Validate topic exists
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    // Get user info
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const displayName = req.user.name || req.userData?.displayName || userEmail.split('@')[0];
    const photoURL = req.user.picture || req.userData?.photoURL;
    
    // Create reply
    const newReply = new Reply({
      topicId,
      content,
      author: {
        uid: userId,
        username: displayName,
        avatarUrl: photoURL
      }
    });
    
    await newReply.save();
    
    // Update topic's reply count
    topic.replyCount = (topic.replyCount || 0) + 1;
    await topic.save();
    
    return res.status(201).json({
      success: true,
      message: 'Reply added successfully',
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

// Delete a topic
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(id);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Check if the user is the author or an admin
    if (topic.author.uid !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this topic' 
      });
    }
    
    // Delete all replies to the topic
    await Reply.deleteMany({ topicId: id });
    
    // Delete the topic
    await Topic.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Topic and all its replies deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTopic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Like or unlike a topic
exports.likeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(id);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Toggle like status
    await topic.toggleLike(req.user.uid);
    
    // Check if the topic is now liked by the user
    const isLiked = topic.isLikedByUser(req.user.uid);
    
    // If it's a new like (not an unlike), create a notification for the topic author
    if (isLiked && topic.author.uid !== req.user.uid) {
      try {
        const authorDoc = await User.findOne({ firebaseUid: topic.author.uid });
        
        if (authorDoc) {
          const likerName = req.userData?.displayName || req.user.email.split('@')[0];
          await authorDoc.addNotification(
            'like', 
            `${likerName} liked your topic "${topic.title}"`,
            topic._id,
            'topic'
          );
        }
      } catch (notifError) {
        console.error('Error creating like notification:', notifError);
        // Continue execution even if notification fails
      }
    }
    
    return res.status(200).json({
      success: true,
      message: isLiked ? 'Topic liked successfully' : 'Topic unliked successfully',
      likes: topic.likes,
      isLiked
    });
  } catch (error) {
    console.error('Error in likeTopic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Bookmark or unbookmark a topic
exports.toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(id);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Toggle bookmark status
    const [updatedTopic, isBookmarked] = await topic.toggleBookmark(req.user.uid);
    
    // Update the user's bookmarks in their document
    const userDoc = await User.findOne({ firebaseUid: req.user.uid });
    
    if (userDoc) {
      if (isBookmarked) {
        await userDoc.addBookmark(topic._id);
      } else {
        await userDoc.removeBookmark(topic._id);
      }
    }
    
    // If it's a new bookmark (not an unbookmark), create a notification for the topic author
    if (isBookmarked && topic.author.uid !== req.user.uid) {
      try {
        const authorDoc = await User.findOne({ firebaseUid: topic.author.uid });
        
        if (authorDoc) {
          const bookmarkerName = req.userData?.displayName || req.user.email.split('@')[0];
          await authorDoc.addNotification(
            'bookmark', 
            `${bookmarkerName} bookmarked your topic "${topic.title}"`,
            topic._id,
            'topic'
          );
        }
      } catch (notifError) {
        console.error('Error creating bookmark notification:', notifError);
        // Continue execution even if notification fails
      }
    }
    
    return res.status(200).json({
      success: true,
      message: isBookmarked ? 'Topic bookmarked successfully' : 'Topic unbookmarked successfully',
      isBookmarked
    });
  } catch (error) {
    console.error('Error in toggleBookmark:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Report a topic
exports.reportTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid topic ID' 
      });
    }
    
    // Validate reason
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'A reason for the report is required' 
      });
    }
    
    // Find the topic
    const topic = await Topic.findById(id);
    
    if (!topic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Topic not found' 
      });
    }
    
    // Add the report
    await topic.report(req.user.uid, reason);
    
    return res.status(200).json({
      success: true,
      message: 'Topic reported successfully'
    });
  } catch (error) {
    console.error('Error in reportTopic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};