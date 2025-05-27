// server/routes/topics.js
const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get all topics (optional authentication for personalized results)
router.get('/', optionalAuth, topicController.getTopics);

// Get a single topic with its replies (optional authentication)
router.get('/:id', optionalAuth, topicController.getTopic);

// Create a new topic (requires authentication)
router.post('/', authenticate, topicController.createTopic);

// Update a topic (requires authentication)
router.patch('/:id', authenticate, topicController.updateTopic);

// Delete a topic (requires authentication)
router.delete('/:id', authenticate, topicController.deleteTopic);

// Like or unlike a topic (requires authentication)
router.post('/:id/like', authenticate, topicController.likeTopic);

// Bookmark or unbookmark a topic (requires authentication)
router.post('/:id/bookmark', authenticate, topicController.toggleBookmark);

// Report a topic (requires authentication)
router.post('/:id/report', authenticate, topicController.reportTopic);

// Create a reply to a topic (requires authentication)
// Note: This could also be in the replies routes, but it's here for logical grouping
router.post('/:topicId/replies', authenticate, topicController.createReply);

module.exports = router;