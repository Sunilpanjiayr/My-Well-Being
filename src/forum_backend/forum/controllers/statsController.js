// forum_backend/controllers/statsController.js
const admin = require('firebase-admin');
const db = admin.firestore();

// Get forum statistics
exports.getForumStats = async (req, res) => {
  try {
    // Get total topic count
    const topicsSnap = await db.collection('topics').get();
    const topicsCount = topicsSnap.size;

    // Get total reply count (collectionGroup for all replies subcollections)
    const repliesSnap = await db.collectionGroup('replies').get();
    const repliesCount = repliesSnap.size;

    // Total posts count (topics + replies)
    const postsCount = topicsCount + repliesCount;

    // Get total user count
    const usersSnap = await db.collection('users').get();
    const usersCount = usersSnap.size;

    // Get newest member
    let newestMember = null;
    let newestTime = 0;
    usersSnap.forEach(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toMillis() > newestTime) {
        newestTime = data.createdAt.toMillis();
        newestMember = {
          username: data.username,
          joinedAt: data.createdAt.toDate()
        };
      }
    });

    // Get most active topics (most replies)
    let mostActiveTopics = [];
    topicsSnap.forEach(doc => {
      const data = doc.data();
      mostActiveTopics.push({
        id: doc.id,
        title: data.title,
        replyCount: data.replyCount || 0,
        views: data.views || 0
      });
    });
    mostActiveTopics.sort((a, b) => b.replyCount - a.replyCount);
    mostActiveTopics = mostActiveTopics.slice(0, 5);

    // Get most viewed topics
    let mostViewedTopics = [];
    topicsSnap.forEach(doc => {
      const data = doc.data();
      mostViewedTopics.push({
        id: doc.id,
        title: data.title,
        views: data.views || 0
      });
    });
    mostViewedTopics.sort((a, b) => b.views - a.views);
    mostViewedTopics = mostViewedTopics.slice(0, 5);

    // Get most liked topics
    let mostLikedTopics = [];
    topicsSnap.forEach(doc => {
      const data = doc.data();
      mostLikedTopics.push({
        id: doc.id,
        title: data.title,
        likes: data.likes || 0
      });
    });
    mostLikedTopics.sort((a, b) => b.likes - a.likes);
    mostLikedTopics = mostLikedTopics.slice(0, 5);

    // Get category distribution
    const categoryMap = {};
    topicsSnap.forEach(doc => {
      const data = doc.data();
      const cat = data.category || 'general';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categories = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
    categories.sort((a, b) => b.count - a.count);

    // Get activity by time (last 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const activityMap = {};
    topicsSnap.forEach(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toMillis() >= thirtyDaysAgo) {
        const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    });
    const activity = Object.entries(activityMap).map(([date, topics]) => ({ date, topics }));
    activity.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      success: true,
      stats: {
        topicsCount,
        postsCount,
        membersCount: usersCount,
        newestMember,
        mostActiveTopics,
        mostViewedTopics,
        mostLikedTopics,
        categories,
        activity
      }
    });
  } catch (error) {
    console.error('Error in getForumStats:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};