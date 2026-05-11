// ============================================================
// src/components/charts/CategoryPieChart.js - Doughnut Chart
// ============================================================

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Fixed colors per category — NO green (green = income only in this app)
const CAT_COLORS = {
  Food:            '#f97316', // orange
  Travel:          '#06b6d4', // cyan
  Shopping:        '#ec4899', // pink
  Rent:            '#f59e0b', // amber
  Entertainment:   '#a855f7', // purple
  Investment:      '#3b82f6', // blue
  Healthcare:      '#ef4444', // red
  Education:       '#8b5cf6', // violet
  Utilities:       '#64748b', // slate
  'Other Expense': '#94a3b8', // grey
};

// Fallback palette (no green) for any unexpected categories
const FALLBACK = ['#f97316','#06b6d4','#ec4899','#f59e0b','#a855f7','#3b82f6','#ef4444','#8b5cf6','#64748b','#94a3b8'];

const getColor = (cat, i) => CAT_COLORS[cat] || FALLBACK[i % FALLBACK.length];

const CategoryPieChart = ({ data }) => {
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '30px', marginBottom: '10px' }}>🥧</p>
        <p style={{ fontSize: '13px' }}>Add expenses to see category breakdown</p>
      </div>
    );
  }

  const total = entries.reduce((s, [, v]) => s + v, 0);

  const chartData = {
    labels: entries.map(([k]) => k),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: entries.map(([cat], i) => getColor(cat, i) + 'cc'),
      borderColor:     entries.map(([cat], i) => getColor(cat, i)),
      borderWidth: 2,
      hoverOffset: 5
    }]
  };

  const options = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a26',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#2d2d3d',
        borderWidth: 1,
        callbacks: {
          label: (ctx) =>
            ` Rs.${ctx.raw.toLocaleString('en-IN')} (${((ctx.raw / total) * 100).toFixed(1)}%)`
        }
      }
    }
  };

  return (
    <div>
      <div style={{ maxWidth: '170px', margin: '0 auto 14px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
        {entries.map(([cat, val], i) => (
          <div key={cat} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: getColor(cat, i),
              flexShrink: 0
            }} />
            <span>{cat}: Rs.{val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;