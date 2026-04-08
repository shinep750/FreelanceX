const express = require('express');
const { getJobMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all messages for a specific job
router.get('/:jobId', protect, getJobMessages);

// Send a message
router.post('/', protect, sendMessage);

module.exports = router;
