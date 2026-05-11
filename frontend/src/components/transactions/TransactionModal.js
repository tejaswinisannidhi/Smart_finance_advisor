// ============================================================
// src/components/transactions/TransactionModal.js
// Modal for Adding / Editing a Transaction
// ============================================================

import { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';

const INCOME_CATS  = ['Salary', 'Freelance', 'Business', 'Investment Returns', 'Other Income'];
const EXPENSE_CATS = ['Food', 'Travel', 'Shopping', 'Rent', 'Entertainment', 'Investment', 'Healthcare', 'Education', 'Utilities', 'Other Expense'];

const CAT_ICONS = {
  Salary: '💵', Freelance: '💻', Business: '🏢', 'Investment Returns': '📊', 'Other Income': '💰',
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Rent: '🏠', Entertainment: '🎮',
  Investment: '📈', Healthcare: '💊', Education: '📚', Utilities: '💡', 'Other Expense': '📦'
};

const TransactionModal = ({ transaction, onClose }) => {
  const { addTransaction, updateTransaction } = useFinance();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type:        'expense',
    amount:      '',
    category:    'Food',
    description: '',
    date:        new Date().toISOString().split('T')[0]
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (transaction) {
      setForm({
        type:        transaction.type,
        amount:      transaction.amount.toString(),
        category:    transaction.category,
        description: transaction.description || '',
        date:        new Date(transaction.date).toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  const categories = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  // When type changes, reset to first category of that type
  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'income' ? 'Salary' : 'Food';
    setForm({ ...form, type: newType, category: defaultCat });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setSaving(true);
    try {
      if (transaction) {
        await updateTransaction(transaction._id, form);
      } else {
        await addTransaction(form);
      }
      onClose();
    } catch {
      // Error handled in context with toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '20px' }}>
            {transaction ? '✏️ Edit Transaction' : '➕ New Transaction'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Type Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label>Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['income', 'expense'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `2px solid ${form.type === t ? (t === 'income' ? '#22c55e' : '#ef4444') : 'var(--border)'}`,
                    background: form.type === t
                      ? (t === 'income' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)')
                      : 'var(--bg-input)',
                    color: form.type === t
                      ? (t === 'income' ? '#4ade80' : '#f87171')
                      : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.15s'
                  }}
                >
                  {t === 'income' ? '💵 Income' : '💸 Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '18px' }}>
            <label>Amount (₹)</label>
            <input
              className="input"
              type="number"
              name="amount"
              min="1"
              step="0.01"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '18px' }}>
            <label>Category</label>
            <select
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CAT_ICONS[cat]} {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '18px' }}>
            <label>Description <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>(optional)</span></label>
            <input
              className="input"
              type="text"
              name="description"
              placeholder="e.g. Salary from TCS, Zomato order"
              value={form.description}
              onChange={handleChange}
              maxLength={200}
            />
          </div>

          {/* Date */}
          <div style={{ marginBottom: '28px' }}>
            <label>Date</label>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {saving
                ? '⏳ Saving...'
                : transaction
                  ? '✅ Update Transaction'
                  : '➕ Add Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
