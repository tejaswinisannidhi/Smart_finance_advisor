// ============================================================
// routes/transactionRoutes.js - Transaction Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

// All transaction routes require authentication
router.use(protect);

// GET  /api/transactions/analytics - Get chart data (MUST be before /:id)
router.get('/analytics', getAnalytics);

// GET  /api/transactions       - Get all transactions (with optional filters)
// POST /api/transactions       - Add new transaction
router.route('/').get(getTransactions).post(addTransaction);

// PUT    /api/transactions/:id  - Update transaction by ID
// DELETE /api/transactions/:id  - Delete transaction by ID
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
