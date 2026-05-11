// ============================================================
// models/Transaction.js - Transaction Database Model
// ============================================================

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      },
      required: [true, 'Transaction type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      set: (val) => parseFloat(val.toFixed(2)) // Round to 2 decimal places
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          // Income categories
          'Salary',
          'Freelance',
          'Business',
          'Investment Returns',
          'Other Income',
          // Expense categories
          'Food',
          'Travel',
          'Shopping',
          'Rent',
          'Entertainment',
          'Investment',
          'Healthcare',
          'Education',
          'Utilities',
          'Other Expense'
        ],
        message: '{VALUE} is not a valid category'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ── Index for faster queries by userId and date ─────────────
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

// ── Virtual: Formatted amount with currency symbol ──────────
transactionSchema.virtual('formattedAmount').get(function () {
  return `₹${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model('Transaction', transactionSchema);
