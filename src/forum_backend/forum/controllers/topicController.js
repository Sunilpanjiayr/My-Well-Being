// server/controllers/topicController.js
const admin = require('firebase-admin');
const db = admin.firestore();

// Helper: get topic doc ref
const topicRef = (id) => db.collection('topics').doc(id);

// Get all topics with filtering options
exports.getTopics = async (req, res) => {
  try {
    const { category, search, sort, view, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    let query = db.collection('topics');

    if (category) {
      query = query.where('category', '==', category);
    }
    if (search) {
      // Firestore doesn't support full text search natively; for now, filter by title/content substring
      // For production, use Algolia or Firestore's new text search features
      // Here, we fetch all and filter in-memory (not scalable for large datasets)
      const snapshot = await query.get();
      let topics = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.title.toLowerCase().includes(search.toLowerCase()) ||
          data.content.toLowerCase().includes(search.toLowerCase())
        ) {
          topics.push({ id: doc.id, ...data });
        }
      });
      // Sort and paginate in-memory
      topics = sortTopics(topics, sort);
      const paged = topics.slice(skip, skip + parseInt(limit));
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
      topics.push({ id: doc.id, ...doc.data() });
    });
    return res.status(200).json(topics);
  } catch (error) {
    console.error('Error in getTopics:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Helper for in-memory sorting
function sortTopics(topics, sort) {
  switch (sort) {
    case 'oldest':
      return topics.sort((a, b) => a.createdAt - b.createdAt);
    case 'mostLiked':
      return topics.sort((a, b) => b.likes - a.likes);
    case 'mostViewed':
      return topics.sort((a, b) => b.views - a.views);
    case 'mostReplies':
      return topics.sort((a, b) => b.replyCount - a.replyCount);
    default:
      return topics.sort((a, b) => b.createdAt - a.createdAt);
  }
}

// Get a single topic with its replies
exports.getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await topicRef(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    const topic = { id: doc.id, ...doc.data() };
    // Increment view count (fire-and-forget)
    topicRef(id).update({ views: admin.firestore.FieldValue.increment(1) }).catch(() => {});
    // Get replies (as subcollection)
    const repliesSnap = await topicRef(id).collection('replies').orderBy('createdAt', 'asc').get();
    const replies = [];
    repliesSnap.forEach(r => replies.push({ id: r.id, ...r.data() }));
    topic.replies = replies;
    return res.status(200).json(topic);
  } catch (error) {
    console.error('Error in getTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const displayName = req.user.name || req.userData?.displayName || userEmail.split('@')[0];
    const photoURL = req.user.picture || req.userData?.photoURL;
    // Compose topic data
    let specialty = null;
    // Check if user is a doctor and get specialty
    const doctorDoc = await db.collection('doctors').doc(userId).get();
    if (doctorDoc.exists) {
      specialty = doctorDoc.data().specialty || null;
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
    const newTopic = { id: docRef.id, ...topicData };
    return res.status(201).json({ success: true, message: 'Topic created successfully', topic: newTopic });
  } catch (error) {
    console.error('Error in createTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
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
    return res.status(200).json({ success: true, message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Error in updateTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    await topicRef(id).delete();
    return res.status(200).json({ success: true, message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Like or unlike a topic
exports.likeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
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
    return res.status(200).json({ success: true, isLiked, likes });
  } catch (error) {
    console.error('Error in likeTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Bookmark or unbookmark a topic
exports.toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
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
    return res.status(200).json({ success: true, isBookmarked });
  } catch (error) {
    console.error('Error in toggleBookmark:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Report a topic
exports.reportTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.uid;
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
    return res.status(200).json({ success: true, message: 'Topic reported' });
  } catch (error) {
    console.error('Error in reportTopic:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a reply to a topic (stub, to be implemented in replyController.js)
exports.createReply = async (req, res) => {
  return res.status(501).json({ success: false, message: 'Not implemented. Use replyController.js for replies.' });
};