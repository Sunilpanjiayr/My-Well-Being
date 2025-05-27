// server/controllers/statsController.js
const Topic = require('../models/Topic');
const Reply = require('../models/Reply');
const User = require('../models/User');

// Get forum statistics
exports.getForumStats = async (req, res) => {
  try {
    // Get total topic count
    const topicsCount = await Topic.countDocuments();
    
    // Get total reply count
    const repliesCount = await Reply.countDocuments();
    
    // Total posts count (topics + replies)
    const postsCount = topicsCount + repliesCount;
    
    // Get total user count
    const usersCount = await User.countDocuments();
    
    // Get newest member
    const newestMember = await User.findOne()
      .sort({ createdAt: -1 })
      .select('username createdAt');
    
    // Get most active topics (most replies)
    const mostActiveTopics = await Topic.find()
      .sort({ replyCount: -1 })
      .limit(5)
      .select('title replyCount views');
    
    // Get most viewed topics
    const mostViewedTopics = await Topic.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views');
    
    // Get most liked topics
    const mostLikedTopics = await Topic.find()
      .sort({ likes: -1 })
      .limit(5)
      .select('title likes');
    
    // Get category distribution
    const categoryStats = await Topic.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Format category stats
    const categories = categoryStats.map(cat => ({
      name: cat._id,
      count: cat.count
    }));
    
    // Get activity by time
    const activityLast30Days = await Topic.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format activity data
    const activity = activityLast30Days.map(day => ({
      date: day._id,
      topics: day.count
    }));
    
    return res.status(200).json({
      success: true,
      stats: {
        topicsCount,
        postsCount,
        membersCount: usersCount,
        newestMember: newestMember ? {
          username: newestMember.username,
          joinedAt: newestMember.createdAt
        } : null,
        mostActiveTopics,
        mostViewedTopics,
        mostLikedTopics,
        categories,
        activity
      }
    });
  } catch (error) {
    console.error('Error in getForumStats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};