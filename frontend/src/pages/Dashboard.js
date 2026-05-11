// ============================================================
// src/pages/Dashboard.js - Main Dashboard Page
// ============================================================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import MonthlyChart from '../components/charts/MonthlyChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';

// ── Category Icon Map ────────────────────────────────────────
const CAT_ICONS = {
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Rent: '🏠',
  Entertainment: '🎮', Investment: '📈', Healthcare: '💊',
  Education: '📚', Utilities: '💡', 'Other Expense': '📦',
  Salary: '💵', Freelance: '💻', Business: '🏢',
  'Investment Returns': '📊', 'Other Income': '💰'
};

// ── Stat Card Component ──────────────────────────────────────
const StatCard = ({ title, value, icon, color, subtitle, isCount }) => (
  <div
    className="card stat-card"
    style={{ borderLeft: `3px solid ${color}` }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{
          fontSize: '11px', color: 'var(--text-secondary)',
          fontWeight: '600', fontFamily: 'Space Grotesk',
          letterSpacing: '.5px', marginBottom: '8px'
        }}>
          {title}
        </p>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: '700', color: title === 'NET SAVINGS' && value < 0 ? '#ef4444' : 'inherit' }}>
          {isCount
            ? value
            : title === 'NET SAVINGS'
              ? `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : `₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{
        width: '46px', height: '46px',
        background: `${color}18`,
        border: `1px solid ${color}30`,
        borderRadius: '13px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', flexShrink: 0
      }}>
        {icon}
      </div>
    </div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const { summary, analytics, transactions, loading, fetchTransactions, fetchAnalytics } = useFinance();

  useEffect(() => {
    fetchTransactions();
    fetchAnalytics();
  }, [fetchTransactions, fetchAnalytics]);

  const savingsRate = summary.income > 0
    ? ((summary.savings / summary.income) * 100).toFixed(1)
    : 0;

  const recentTxns = transactions.slice(0, 6);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Financial overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard
          title="TOTAL INCOME"
          value={summary.income}
          icon="💵"
          color="#22c55e"
          subtitle="All transactions"
        />
        <StatCard
          title="TOTAL EXPENSES"
          value={summary.expenses}
          icon="💸"
          color="#ef4444"
          subtitle="All transactions"
        />
        <StatCard
          title="NET SAVINGS"
          value={summary.savings}
          icon="🏦"
          color="#3b82f6"
          subtitle={`${savingsRate}% savings rate`}
        />
        <StatCard
          title="TRANSACTIONS"
          value={transactions.length}
          icon="📋"
          color="#a855f7"
          subtitle="Total entries"
          isCount
        />
      </div>

      {/* ── Charts Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px', marginBottom: '18px' }}>
            📈 Monthly Income vs Expenses
          </h3>
          <MonthlyChart data={analytics.monthlyData} />
        </div>
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px', marginBottom: '18px' }}>
            🥧 Spending Breakdown
          </h3>
          <CategoryPieChart data={analytics.categoryData} />
        </div>
      </div>

      {/* ── Savings Rate Banner ── */}
      {summary.income > 0 && (
        <div style={{
          background: parseFloat(savingsRate) >= 20
            ? 'linear-gradient(135deg, rgba(34,197,94,.1), rgba(34,197,94,.04))'
            : parseFloat(savingsRate) >= 10
              ? 'linear-gradient(135deg, rgba(245,158,11,.1), rgba(245,158,11,.04))'
              : 'linear-gradient(135deg, rgba(239,68,68,.1), rgba(239,68,68,.04))',
          border: `1px solid ${parseFloat(savingsRate) >= 20 ? 'rgba(34,197,94,.22)' : parseFloat(savingsRate) >= 10 ? 'rgba(245,158,11,.22)' : 'rgba(239,68,68,.22)'}`,
          borderRadius: '14px',
          padding: '18px 22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
              {parseFloat(savingsRate) >= 20
                ? '🚀 Excellent savings rate!'
                : parseFloat(savingsRate) >= 10
                  ? '💪 Decent progress!'
                  : parseFloat(savingsRate) < 0
                    ? '🔴 Overspending! Expenses exceed income'
                    : '⚠️ Low savings rate — needs attention'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              You're saving {savingsRate}% of your income.{' '}
              {parseFloat(savingsRate) < 0
                ? 'Cut expenses immediately — you are spending more than you earn!'
                : parseFloat(savingsRate) < 20
                  ? 'Target 20% for solid financial health.'
                  : 'Keep up the great work!'}
            </p>
          </div>
          <Link to="/ai-advisor" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', flexShrink: 0 }}>
            Get AI Advice 🤖
          </Link>
        </div>
      )}

      {/* ── Recent Transactions ── */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px' }}>
            🕐 Recent Transactions
          </h3>
          <Link
            to="/transactions"
            style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: '500' }}
          >
            View all →
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>🪙</p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: '500', fontSize: '16px', marginBottom: '6px' }}>
              No transactions yet
            </p>
            <p style={{ fontSize: '13px', marginBottom: '20px' }}>
              Start by adding your income or expenses!
            </p>
            <Link to="/transactions" className="btn-primary" style={{ textDecoration: 'none' }}>
              + Add First Transaction
            </Link>
          </div>
        ) : (
          <div>
            {recentTxns.map((t, i) => (
              <div
                key={t._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 22px',
                  borderBottom: i < recentTxns.length - 1 ? '1px solid rgba(45,45,61,.5)' : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')}
                onMouseOut={(e)  => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Left: icon + details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px',
                    background: t.type === 'income' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '19px', flexShrink: 0
                  }}>
                    {CAT_ICONS[t.category] || '💰'}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Space Grotesk', fontWeight: '500', fontSize: '14px' }}>
                      {t.category}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {t.description || t.type} &middot;{' '}
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Right: amount */}
                <span style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: '700',
                  fontSize: '15px',
                  color: t.type === 'income' ? '#4ade80' : '#f87171',
                  flexShrink: 0
                }}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;