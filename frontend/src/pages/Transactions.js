// ============================================================
// src/pages/Transactions.js - Transaction Management Page
// ============================================================

import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import TransactionModal from '../components/transactions/TransactionModal';

const CAT_ICONS = {
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Rent: '🏠',
  Entertainment: '🎮', Investment: '📈', Healthcare: '💊',
  Education: '📚', Utilities: '💡', 'Other Expense': '📦',
  Salary: '💵', Freelance: '💻', Business: '🏢',
  'Investment Returns': '📊', 'Other Income': '💰'
};

const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment Returns', 'Other Income',
  'Food', 'Travel', 'Shopping', 'Rent', 'Entertainment',
  'Investment', 'Healthcare', 'Education', 'Utilities', 'Other Expense'
];

const Transactions = () => {
  const { transactions, summary, loading, fetchTransactions, deleteTransaction } = useFinance();
  const [showModal, setShowModal]     = useState(false);
  const [editTx, setEditTx]           = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [filter, setFilter]           = useState({ type: '', category: '' });

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const openAddModal  = () => { setEditTx(null); setShowModal(true); };
  const openEditModal = (tx) => { setEditTx(tx);  setShowModal(true); };
  const closeModal    = () => { setShowModal(false); setEditTx(null); };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  // Apply client-side filters
  const filtered = transactions.filter((t) => {
    if (filter.type     && t.type     !== filter.type)     return false;
    if (filter.category && t.category !== filter.category) return false;
    return true;
  });

  return (
    <div className="page-wrapper">

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Transactions 💳</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {transactions.length} total &middot; Showing {filtered.length}
          </p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          ＋ Add Transaction
        </button>
      </div>

      {/* ── Summary Mini Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Total Income',   value: summary.income,   color: '#22c55e', icon: '💵' },
          { label: 'Total Expenses', value: summary.expenses, color: '#ef4444', icon: '💸' },
          { label: 'Net Savings',    value: summary.savings,  color: '#3b82f6', icon: '🏦' }
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '16px 18px', borderTop: `3px solid ${item.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', fontFamily: 'Space Grotesk', marginBottom: '3px' }}>
                  {item.label.toUpperCase()}
                </p>
                <p style={{ fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '17px' }}>
                  ₹{Math.abs(item.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          className="input"
          style={{ maxWidth: '150px' }}
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="income">💵 Income</option>
          <option value="expense">💸 Expense</option>
        </select>

        <select
          className="input"
          style={{ maxWidth: '200px' }}
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{CAT_ICONS[cat]} {cat}</option>
          ))}
        </select>

        {(filter.type || filter.category) && (
          <button
            className="btn-secondary"
            onClick={() => setFilter({ type: '', category: '' })}
            style={{ fontSize: '13px', padding: '9px 16px' }}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* ── Transactions Table ── */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: '500', fontSize: '16px', marginBottom: '6px' }}>
              {filter.type || filter.category ? 'No results found' : 'No transactions yet'}
            </p>
            <p style={{ fontSize: '13px' }}>
              {filter.type || filter.category
                ? 'Try clearing your filters'
                : 'Add your first transaction using the button above!'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>DESCRIPTION</th>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id}>

                    {/* Category */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          background: t.type === 'income' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '17px', flexShrink: 0
                        }}>
                          {CAT_ICONS[t.category] || '💰'}
                        </div>
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: '500', fontSize: '13px' }}>
                          {t.category}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description || '—'}
                    </td>

                    {/* Date */}
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Type badge */}
                    <td>
                      <span className={`badge badge-${t.type}`}>
                        {t.type === 'income' ? '⬆️ Income' : '⬇️ Expense'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className={t.type === 'income' ? 'amount-income' : 'amount-expense'} style={{ fontSize: '14px' }}>
                        {t.type === 'income' ? '+' : '−'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '7px' }}>
                        <button className="btn-edit" onClick={() => openEditModal(t)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-danger" onClick={() => setDeleteId(t._id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <TransactionModal transaction={editTx} onClose={closeModal} />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: '360px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>
              Delete Transaction?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                className="btn-danger"
                style={{ padding: '11px 24px', fontSize: '14px' }}
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
