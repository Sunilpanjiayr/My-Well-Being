// server/routes/replies.js
const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');
const { authenticate } = require('../middleware/auth');

// Update a reply
router.patch('/:id', authenticate, replyController.updateReply);

// Delete a reply
router.delete('/:id', authenticate, replyController.deleteReply);

// Like or unlike a reply
router.post('/:id/like', authenticate, replyController.likeReply);

// Report a reply
router.post('/:id/report', authenticate, replyController.reportReply);

// Note: Creating a reply is handled in the topics routes (POST /topics/:topicId/replies)
// This is for logical grouping with the topic it belongs to

module.exports = router;