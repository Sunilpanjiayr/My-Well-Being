const admin = require('../../config/firebaseAdmin');
const db = admin.firestore();

// Helper: get topic doc ref
const topicRef = (id) => db.collection('topics').doc(id);
// Helper: get reply doc ref
const replyRef = (topicId, replyId) => topicRef(topicId).collection('replies').doc(replyId);

// Create a reply
exports.createReply = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content, parentReplyId, attachments } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }
    // Check topic exists
    const topicDoc = await topicRef(topicId).get();
    if (!topicDoc.exists) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    // If parentReplyId is provided, check it exists
    if (parentReplyId) {
      const parentReplyDoc = await replyRef(topicId, parentReplyId).get();
      if (!parentReplyDoc.exists) {
        return res.status(404).json({ success: false, message: 'Parent reply not found' });
      }
    }
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const displayName = req.user.name || req.userData?.displayName || userEmail.split('@')[0];
    const photoURL = req.user.picture || req.userData?.photoURL;
    // Check if user is a doctor and get specialty
    let specialty = null;
    const doctorDoc = await db.collection('doctors').doc(userId).get();
    if (doctorDoc.exists) {
      specialty = doctorDoc.data().specialty || null;
    }
    const replyData = {
      content: content.trim(),
      topicId,
      parentReplyId: parentReplyId || null,
      attachments: attachments || [],
      author: {
        uid: userId,
        username: displayName,
        avatarUrl: photoURL,
        joinDate: admin.firestore.Timestamp.now(),
        ...(specialty ? { specialty } : {})
      },
      likes: 0,
      likedBy: [],
      reports: [],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    const newReplyRef = await topicRef(topicId).collection('replies').add(replyData);
    // Increment replyCount on topic
    await topicRef(topicId).update({ replyCount: admin.firestore.FieldValue.increment(1) });
    const newReply = { id: newReplyRef.id, ...replyData };
    return res.status(201).json({ success: true, message: 'Reply created successfully', reply: newReply });
  } catch (error) {
    console.error('Error in createReply:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a reply
exports.updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments, topicId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }
    const replyDoc = await replyRef(topicId, id).get();
    if (!replyDoc.exists) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    const reply = replyDoc.data();
    if (reply.author.uid !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this reply' });
    }
    const updates = {
      content: content.trim(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    if (attachments) updates.attachments = attachments;
    await replyRef(topicId, id).update(updates);
    return res.status(200).json({ success: true, message: 'Reply updated successfully' });
  } catch (error) {
    console.error('Error in updateReply:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicId } = req.body;
    const replyDoc = await replyRef(topicId, id).get();
    if (!replyDoc.exists) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    const reply = replyDoc.data();
    if (reply.author.uid !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this reply' });
    }
    await replyRef(topicId, id).delete();
    // Decrement replyCount on topic
    await topicRef(topicId).update({ replyCount: admin.firestore.FieldValue.increment(-1) });
    return res.status(200).json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReply:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Like or unlike a reply
exports.likeReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicId } = req.body;
    const userId = req.user.uid;
    const replyDoc = await replyRef(topicId, id).get();
    if (!replyDoc.exists) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    const reply = replyDoc.data();
    let likedBy = reply.likedBy || [];
    let likes = reply.likes || 0;
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
    await replyRef(topicId, id).update({ likedBy, likes });
    return res.status(200).json({ success: true, isLiked, likes });
  } catch (error) {
    console.error('Error in likeReply:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Report a reply
exports.reportReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicId, reason } = req.body;
    const userId = req.user.uid;
    const replyDoc = await replyRef(topicId, id).get();
    if (!replyDoc.exists) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    const reply = replyDoc.data();
    let reports = reply.reports || [];
    // Check if user already reported
    const existing = reports.find(r => r.userId === userId);
    if (existing) {
      existing.reason = reason;
      existing.createdAt = admin.firestore.Timestamp.now();
      existing.resolved = false;
    } else {
      reports.push({ userId, reason, createdAt: admin.firestore.Timestamp.now(), resolved: false });
    }
    await replyRef(topicId, id).update({ reports });
    return res.status(200).json({ success: true, message: 'Reply reported' });
  } catch (error) {
    console.error('Error in reportReply:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
