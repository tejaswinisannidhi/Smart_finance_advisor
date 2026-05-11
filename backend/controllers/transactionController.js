// ============================================================
// controllers/transactionController.js - Transaction CRUD Logic
// ============================================================

const Transaction = require('../models/Transaction');

// ============================================================
// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
// Query params: ?type=income|expense&category=Food&month=3&year=2026
// ============================================================
const getTransactions = async (req, res) => {
  try {
    const { type, category, month, year } = req.query;

    // Build filter object
    let filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    // Filter by specific month and year
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Fetch sorted by date descending
    const transactions = await Transaction.find(filter).sort({ date: -1 });

    // Calculate summary totals
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      count: transactions.length,
      summary: {
        income: parseFloat(income.toFixed(2)),
        expenses: parseFloat(expenses.toFixed(2)),
        savings: parseFloat((income - expenses).toFixed(2))
      },
      transactions
    });

  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// ============================================================
// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
// ============================================================
const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    // Validate required fields
    if (!type || !amount || !category) {
      return res.status(400).json({
        message: 'Please provide type, amount, and category'
      });
    }

    // Validate amount is positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Add Transaction Error:', error);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
};

// ============================================================
// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
// ============================================================
const updateTransaction = async (req, res) => {
  try {
    // Find the transaction
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure user owns this transaction
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to update this transaction'
      });
    }

    const { type, amount, category, description, date } = req.body;

    // Update fields if provided
    if (type) transaction.type = type;
    if (amount) transaction.amount = parseFloat(amount);
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Update Transaction Error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// ============================================================
// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
// ============================================================
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure user owns this transaction
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      deletedId: req.params.id
    });

  } catch (error) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// ============================================================
// @desc    Get analytics data for charts (last 6 months)
// @route   GET /api/transactions/analytics
// @access  Private
// ============================================================
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Get transactions from last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    // ── Build Monthly Data ───────────────────────────────────
    const monthlyData = {};
    transactions.forEach((t) => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[key].income += t.amount;
      } else {
        monthlyData[key].expenses += t.amount;
      }
    });

    // Round values
    Object.keys(monthlyData).forEach((k) => {
      monthlyData[k].income = parseFloat(monthlyData[k].income.toFixed(2));
      monthlyData[k].expenses = parseFloat(monthlyData[k].expenses.toFixed(2));
    });

    // ── Build Category Data (expenses only) ─────────────────
    const categoryData = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryData[t.category] = parseFloat(
          ((categoryData[t.category] || 0) + t.amount).toFixed(2)
        );
      });

    res.json({
      success: true,
      monthlyData,
      categoryData
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Server error getting analytics' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics
};
