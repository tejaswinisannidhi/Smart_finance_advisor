// ============================================================
// src/pages/Predictor.js - Savings Predictor Page
// ============================================================

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import API from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Predictor = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const { data: res } = await API.get('/ai/predict');
        setData(res);
      } catch (err) {
        setError('Failed to load prediction data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Calculating your forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</p>
        <p>{error}</p>
      </div>
    );
  }

  const { currentMonth, averages, sixMonthForecast: forecast } = data || {};
  const totalForecastSavings = forecast?.[forecast.length - 1]?.cumulativeSavings || 0;

  // ── Chart Data ───────────────────────────────────────────────
  const chartData = {
    labels: forecast?.map((f) => f.month) || [],
    datasets: [
      {
        label: 'Monthly Savings',
        data: forecast?.map((f) => f.projectedSavings) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.65)',
        borderColor: '#22c55e',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Cumulative Savings',
        data: forecast?.map((f) => f.cumulativeSavings) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.45)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 }, boxWidth: 12, boxHeight: 12 }
      },
      tooltip: {
        backgroundColor: '#1a1a26',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#2d2d3d',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw?.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: {
        ticks: {
          color: '#94a3b8',
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`
        },
        grid: { color: 'rgba(45,45,61,.4)' }
      }
    }
  };

  return (
    <div className="page-wrapper">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>
          Savings Predictor 🔮
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          AI-powered forecast based on your last 3 months of data
        </p>
      </div>

      {/* ── Current Month Forecast ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,.1), rgba(34,197,94,.03))',
        border: '1px solid rgba(34,197,94,.2)',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '22px'
      }}>
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '16px', marginBottom: '18px' }}>
          📅 This Month's Projection
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Expected Income',        value: currentMonth?.income,               color: '#22c55e', icon: '💵' },
            { label: 'Projected Expenses',     value: currentMonth?.expenses,             color: '#ef4444', icon: '💸' },
            { label: 'End-of-Month Savings',   value: currentMonth?.projectedEndOfMonth,  color: '#3b82f6', icon: '🎯' }
          ].map((item) => (
            <div key={item.label} className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{item.icon}</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', fontFamily: 'Space Grotesk', marginBottom: '5px' }}>
                {item.label.toUpperCase()}
              </p>
              <p style={{
                fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '22px',
                color: (item.value !== undefined && item.value >= 0) ? item.color : '#ef4444'
              }}>
                ₹{item.value !== undefined ? Math.abs(item.value).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-Month Averages ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Avg Monthly Income',   value: averages?.income,   color: '#22c55e' },
          { label: 'Avg Monthly Expenses', value: averages?.expenses, color: '#ef4444' },
          { label: 'Avg Monthly Savings',  value: averages?.savings,  color: '#a855f7' }
        ].map((item) => (
          <div key={item.label} className="card" style={{ textAlign: 'center', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', fontFamily: 'Space Grotesk', marginBottom: '6px' }}>
              {item.label.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '20px', color: item.color }}>
              ₹{item.value !== undefined ? Math.abs(item.value).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Based on last 3 months</p>
          </div>
        ))}
      </div>

      {/* ── 6-Month Forecast Chart ── */}
      {forecast && forecast.length > 0 ? (
        <>
          <div className="card" style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px' }}>
                📈 6-Month Savings Forecast
              </h3>
              <div style={{
                padding: '7px 15px',
                background: 'rgba(34,197,94,.1)',
                border: '1px solid rgba(34,197,94,.2)',
                borderRadius: '20px',
                fontSize: '13px', fontWeight: '600',
                color: '#4ade80',
                fontFamily: 'Space Grotesk'
              }}>
                Total Projected: ₹{totalForecastSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Bar data={chartData} options={chartOptions} height={80} />
          </div>

          {/* ── Forecast Table ── */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '15px' }}>
                📋 Month-by-Month Breakdown
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MONTH</th>
                    <th>PROJECTED INCOME</th>
                    <th>PROJECTED EXPENSES</th>
                    <th>MONTHLY SAVINGS</th>
                    <th>CUMULATIVE TOTAL</th>
                    <th>PROGRESS</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((f, i) => {
                    const pct = totalForecastSavings > 0
                      ? (f.cumulativeSavings / totalForecastSavings) * 100
                      : 0;
                    return (
                      <tr key={i}>
                        <td style={{ fontFamily: 'Space Grotesk', fontWeight: '500' }}>{f.month}</td>
                        <td className="amount-income">₹{f.projectedIncome.toLocaleString('en-IN')}</td>
                        <td className="amount-expense">₹{f.projectedExpenses.toLocaleString('en-IN')}</td>
                        <td className={f.projectedSavings >= 0 ? 'amount-income' : 'amount-expense'}>
                          ₹{f.projectedSavings.toLocaleString('en-IN')}
                        </td>
                        <td className="amount-savings">₹{f.cumulativeSavings.toLocaleString('en-IN')}</td>
                        <td style={{ minWidth: '140px' }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.max(0, pct)}%` }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {pct.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📊</p>
          <p style={{ fontFamily: 'Space Grotesk', fontWeight: '500', fontSize: '16px', marginBottom: '6px' }}>No data available</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Add at least a few transactions to generate your 6-month savings forecast.
          </p>
        </div>
      )}

    </div>
  );
};

export default Predictor;
