const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Get all transactions (Admin only)
router.get('/', protect, isAdmin, transactionController.getAllTransactions);

module.exports = router;
