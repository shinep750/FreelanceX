const express = require('express');
const { updateProfile, getProfile, getPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get logged in user's profile
router.get('/profile', protect, getProfile);

// Protected route to update a user's profile (supports form-data profileImage)
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// Get public profile by user ID
router.get('/profile/:id', protect, getPublicProfile);

module.exports = router;
