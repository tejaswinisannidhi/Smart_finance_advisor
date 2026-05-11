// ============================================================
// src/pages/AIAdvisor.js - AI Financial Advisor Page
// ============================================================

import { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

// ── Single advice card section ───────────────────────────────
const AdviceCard = ({ title, icon, items, accentColor }) => (
  <div className="card" style={{ borderLeft: `3px solid ${accentColor}` }}>
    <h3 style={{
      fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px',
      marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items?.map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: '10px',
          padding: '11px 13px',
          background: 'var(--bg-input)',
          borderRadius: '10px',
          fontSize: '13px',
          lineHeight: '1.55',
          color: 'var(--text-primary)'
        }}>
          <span style={{ color: accentColor, fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>→</span>
          {item}
        </div>
      ))}
    </div>
  </div>
);

// ── Feature Preview Card ─────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div className="card stat-card">
    <div style={{ fontSize: '34px', marginBottom: '12px' }}>{icon}</div>
    <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>
      {title}
    </h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

// ── Main AIAdvisor Component ─────────────────────────────────
const AIAdvisor = () => {
  const [advice, setAdvice] = useState(null);
  const [note, setNote]     = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    setAdvice(null);
    try {
      const { data } = await API.post('/ai/advice');
      setAdvice(data.advice);
      setNote(data.note || '');
      toast.success('AI analysis ready! 🤖');
    } catch (error) {
      toast.error('Failed to get AI advice. Try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>
          AI Financial Advisor 🤖
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Get smart, personalized advice based on your actual spending
        </p>
      </div>

      {/* ── Hero CTA ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,.1), rgba(59,130,246,.07))',
        border: '1px solid rgba(34,197,94,.2)',
        borderRadius: '20px',
        padding: '36px 32px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '58px', marginBottom: '16px' }}>🧠</div>
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '22px', marginBottom: '10px' }}>
          Your Personal Finance AI
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.7' }}>
          Analyzes your last 3 months of transactions to deliver hyper-personalized
          budget tips, savings hacks, and investment ideas — all tailored for GenZ India.
        </p>

        <button
          className="btn-primary"
          onClick={fetchAdvice}
          disabled={loading}
          style={{ fontSize: '15px', padding: '14px 36px', justifyContent: 'center' }}
        >
          {loading
            ? <><span className="animate-spin" style={{ display: 'inline-block' }}>⏳</span> Analyzing your finances...</>
            : '✨ Get My AI Advice'}
        </button>

        {note && (
          <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            ℹ️ {note}
          </p>
        )}
      </div>

      {/* ── AI Results ── */}
      {advice && (
        <div className="animate-fade-in">

          {/* Summary Box */}
          {advice.summary && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(34,197,94,.25)',
              borderRadius: '14px',
              padding: '20px 22px',
              marginBottom: '20px'
            }}>
              <p style={{ fontFamily: 'Space Grotesk', fontSize: '13px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '8px' }}>
                💬 AI Summary
              </p>
              <p style={{ fontSize: '14px', lineHeight: '1.75', color: 'var(--text-primary)' }}>
                {advice.summary}
              </p>
            </div>
          )}

          {/* Advice Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <AdviceCard
              title="Budget Suggestions"
              icon="📊"
              items={advice.budgetSuggestions}
              accentColor="#22c55e"
            />
            <AdviceCard
              title="Saving Recommendations"
              icon="🏦"
              items={advice.savingRecommendations}
              accentColor="#3b82f6"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
            <AdviceCard
              title="Investment Ideas for GenZ"
              icon="📈"
              items={advice.investmentSuggestions}
              accentColor="#a855f7"
            />
            {advice.overspendingAlerts?.length > 0 && (
              <AdviceCard
                title="Overspending Alerts"
                icon="⚠️"
                items={advice.overspendingAlerts}
                accentColor="#f59e0b"
              />
            )}
          </div>

          {/* Refresh */}
          <div style={{ textAlign: 'center' }}>
            <button className="btn-secondary" onClick={fetchAdvice} disabled={loading}>
              🔄 Refresh Advice
            </button>
          </div>
        </div>
      )}

      {/* ── Feature Preview (shown before first fetch) ── */}
      {!advice && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <FeatureCard icon="📊" title="Budget Analysis"
            desc="AI breaks down your spending vs income and gives you a personalised 50/30/20 budget plan." />
          <FeatureCard icon="🏦" title="Savings Hacks"
            desc="Get actionable tips to boost savings — from automating transfers to spotting hidden leaks." />
          <FeatureCard icon="📈" title="Investment Starter"
            desc="Beginner-friendly Indian investment ideas: SIP, index funds, PPF, Roth-equivalent accounts." />
          <FeatureCard icon="⚠️" title="Overspend Alerts"
            desc="Get warned when a category exceeds a healthy % of your income with exact numbers." />
        </div>
      )}

    </div>
  );
};

export default AIAdvisor;
