// src/forum_backend/controllers/topicController.js
const admin = require('../../config/firebaseAdmin');
const db = admin.firestore();

// Helper: get topic doc ref
const topicRef = (id) => db.collection('topics').doc(id);

// Get all topics with filtering options
exports.getTopics = async (req, res) => {
  try {
    console.log('📋 Forum: Getting topics with query:', req.query);
    
    const { category, search, sort, view, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    let query = db.collection('topics');

    // Apply user-specific filters if authenticated
    if (view && req.user) {
      const userId = req.user.uid;
      
      if (view === 'myTopics') {
        query = query.where('author.uid', '==', userId);
      } else if (view === 'bookmarks') {
        query = query.where('bookmarkedBy', 'array-contains', userId);
      }
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    // For search, we need to get all and filter (Firestore limitation)
    if (search) {
      const snapshot = await query.get();
      let topics = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.title.toLowerCase().includes(search.toLowerCase()) ||
          data.content.toLowerCase().includes(search.toLowerCase())
        ) {
          // Convert Firestore timestamps
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            data.updatedAt = data.updatedAt.toDate().toISOString();
          }
          topics.push({ id: doc.id, ...data });
        }
      });
      
      // Sort and paginate in-memory
      topics = sortTopics(topics, sort);
      const paged = topics.slice(skip, skip + parseInt(limit));
      
      console.log(`✅ Forum: Found ${topics.length} topics matching search`);
      return res.status(200).json(paged);
    }

    // Sorting
    let orderByField = 'createdAt';
    let orderByDir = 'desc';
    switch (sort) {
      case 'oldest':
        orderByDir = 'asc';
        break;
      case 'mostLiked':
        orderByField = 'likes';
        break;
      case 'mostViewed':
        orderByField = 'views';
        break;
      case 'mostReplies':
        orderByField = 'replyCount';
        break;
      default:
        orderByField = 'createdAt';
    }

    query = query.orderBy(orderByField, orderByDir);
    
    // Pagination
    const snapshot = await query.offset(skip).limit(parseInt(limit)).get();
    const topics = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to ISO strings for frontend
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && data.updatedAt.toDate) {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      topics.push({ id: doc.id, ...data });
    });

    console.log(`✅ Forum: Retrieved ${topics.length} topics`);
    return res.status(200).json(topics);
  } catch (error) {
    console.error('❌ Forum: Error in getTopics:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Helper for in-memory sorting
function sortTopics(topics, sort) {
  switch (sort) {
    case 'oldest':
      return topics.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'mostLiked':
      return topics.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    case 'mostViewed':
      return topics.sort((a, b) => (b.views || 0) - (a.views || 0));
    case 'mostReplies':
      return topics.sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
    default:
      return topics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

// Get a single topic with its replies
exports.getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Forum: Getting topic:', id);
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    
    const doc = await topicRef(id).get();
    if (!doc.exists) {
      console.log('❌ Forum: Topic not found:', id);
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const topicData = doc.data();
    
    // Convert Firestore timestamps
    if (topicData.createdAt && topicData.createdAt.toDate) {
      topicData.createdAt = topicData.createdAt.toDate().toISOString();
    }
    if (topicData.updatedAt && topicData.updatedAt.toDate) {
      topicData.updatedAt = topicData.updatedAt.toDate().toISOString();
    }
    
    const topic = { id: doc.id, ...topicData };

    // Increment view count (fire-and-forget)
    topicRef(id).update({ views: admin.firestore.FieldValue.increment(1) }).catch(() => {});

    // Get replies (as subcollection)
    const repliesSnap = await topicRef(id).collection('replies').orderBy('createdAt', 'asc').get();
    const replies = [];
    repliesSnap.forEach(r => {
      const replyData = r.data();
      // Convert Firestore timestamps
      if (replyData.createdAt && replyData.createdAt.toDate) {
        replyData.createdAt = replyData.createdAt.toDate().toISOString();
      }
      if (replyData.updatedAt && replyData.updatedAt.toDate) {
        replyData.updatedAt = replyData.updatedAt.toDate().toISOString();
      }
      replies.push({ id: r.id, _id: r.id, ...replyData });
    });

    topic.replies = replies;
    
    console.log(`✅ Forum: Retrieved topic with ${replies.length} replies`);
    return res.status(200).json(topic);
  } catch (error) {
    console.error('❌ Forum: Error in getTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    console.log('📝 Forum: Creating topic:', { title, category, tagsCount: tags?.length });
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const userId = req.user.uid;
    const userEmail = req.user.email;
    const displayName = req.user.name || req.userData?.displayName || userEmail.split('@')[0];
    const photoURL = req.user.picture || req.userData?.photoURL;

    // Check if user is a doctor and get specialty
    let specialty = null;
    try {
      const doctorDoc = await db.collection('doctors').doc(userId).get();
      if (doctorDoc.exists) {
        specialty = doctorDoc.data().specialty || null;
      }
    } catch (doctorError) {
      console.log('ℹ️ Forum: User is not a doctor or error checking doctor status');
    }

    const topicData = {
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      author: {
        uid: userId,
        username: displayName,
        avatarUrl: photoURL,
        joinDate: admin.firestore.Timestamp.now(),
        ...(specialty ? { specialty } : {})
      },
      views: 0,
      likes: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      likedBy: [],
      bookmarkedBy: [],
      reports: [],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('topics').add(topicData);
    
    // Convert timestamps for response
    const responseData = { ...topicData };
    responseData.createdAt = topicData.createdAt.toDate().toISOString();
    responseData.updatedAt = topicData.updatedAt.toDate().toISOString();
    
    const newTopic = { id: docRef.id, _id: docRef.id, ...responseData };
    
    console.log('✅ Forum: Topic created with ID:', docRef.id);
    return res.status(201).json({ success: true, message: 'Topic created successfully', topic: newTopic });
  } catch (error) {
    console.error('❌ Forum: Error in createTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    
    const doc = await topicRef(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const updates = { updatedAt: admin.firestore.Timestamp.now() };
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (tags) updates.tags = tags;

    await topicRef(id).update(updates);
    
    console.log('✅ Forum: Topic updated:', id);
    return res.status(200).json({ success: true, message: 'Topic updated successfully' });
  } catch (error) {
    console.error('❌ Forum: Error in updateTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    
    await topicRef(id).delete();
    
    console.log('✅ Forum: Topic deleted:', id);
    return res.status(200).json({ success: true, message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('❌ Forum: Error in deleteTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Like or unlike a topic
exports.likeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    
    const doc = await topicRef(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const topic = doc.data();
    let likedBy = topic.likedBy || [];
    let likes = topic.likes || 0;
    let isLiked;

    if (likedBy.includes(userId)) {
      likedBy = likedBy.filter(uid => uid !== userId);
      likes = Math.max(0, likes - 1);
      isLiked = false;
    } else {
      likedBy.push(userId);
      likes += 1;
      isLiked = true;
    }

    await topicRef(id).update({ likedBy, likes });
    
    console.log(`✅ Forum: Topic ${isLiked ? 'liked' : 'unliked'}:`, id);
    return res.status(200).json({ success: true, isLiked, likes });
  } catch (error) {
    console.error('❌ Forum: Error in likeTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Bookmark or unbookmark a topic
exports.toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    
    const doc = await topicRef(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const topic = doc.data();
    let bookmarkedBy = topic.bookmarkedBy || [];
    let isBookmarked;

    if (bookmarkedBy.includes(userId)) {
      bookmarkedBy = bookmarkedBy.filter(uid => uid !== userId);
      isBookmarked = false;
    } else {
      bookmarkedBy.push(userId);
      isBookmarked = true;
    }

    await topicRef(id).update({ bookmarkedBy });
    
    console.log(`✅ Forum: Topic ${isBookmarked ? 'bookmarked' : 'unbookmarked'}:`, id);
    return res.status(200).json({ success: true, isBookmarked });
  } catch (error) {
    console.error('❌ Forum: Error in toggleBookmark:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Report a topic
exports.reportTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.uid;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    
    const doc = await topicRef(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const topic = doc.data();
    let reports = topic.reports || [];
    
    // Check if user already reported
    const existing = reports.find(r => r.userId === userId);
    if (existing) {
      existing.reason = reason;
      existing.createdAt = admin.firestore.Timestamp.now();
      existing.resolved = false;
    } else {
      reports.push({ userId, reason, createdAt: admin.firestore.Timestamp.now(), resolved: false });
    }

    await topicRef(id).update({ reports });
    
    console.log('✅ Forum: Topic reported:', id);
    return res.status(200).json({ success: true, message: 'Topic reported' });
  } catch (error) {
    console.error('❌ Forum: Error in reportTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// REMOVED: createReply stub - this is handled by replyController now