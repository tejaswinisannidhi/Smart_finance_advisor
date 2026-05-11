// ============================================================
// src/components/charts/MonthlyChart.js - Bar Chart
// ============================================================

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyChart = ({ data }) => {
  const labels = Object.keys(data || {}).sort();

  if (labels.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '30px', marginBottom: '10px' }}>📊</p>
        <p style={{ fontSize: '13px' }}>Add transactions to see monthly chart</p>
      </div>
    );
  }

  // Format label: "2026-03" → "Mar '26"
  const formatLabel = (key) => {
    const [year, month] = key.split('-');
    return new Date(parseInt(year), parseInt(month) - 1)
      .toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  const chartData = {
    labels: labels.map(formatLabel),
    datasets: [
      {
        label: 'Income',
        data: labels.map((k) => data[k]?.income || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.75)',
        borderColor: '#22c55e',
        borderWidth: 2,
        borderRadius: 7,
        borderSkipped: false
      },
      {
        label: 'Expenses',
        data: labels.map((k) => data[k]?.expenses || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.65)',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 7,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'DM Sans', size: 12 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#1a1a26',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#2d2d3d',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`
        },
        grid: { color: 'rgba(45,45,61,.4)' }
      }
    }
  };

  return <Bar data={chartData} options={options} height={100} />;
};

export default MonthlyChart;
