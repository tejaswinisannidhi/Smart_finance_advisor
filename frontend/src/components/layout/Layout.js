// ============================================================
// src/components/layout/Layout.js - App Shell with Sidebar
// ============================================================

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',         icon: '📊' },
  { path: '/transactions', label: 'Transactions',       icon: '💳' },
  { path: '/ai-advisor',   label: 'AI Advisor',         icon: '🤖' },
  { path: '/predictor',    label: 'Savings Predictor',  icon: '🔮' }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '255px',
        minWidth: '255px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 14px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 20,
        overflowY: 'auto'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '36px', padding: '0 6px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 16px rgba(34,197,94,.3)'
          }}>💰</div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
              FinanceAI
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: '500' }}>
              Smart Advisor
            </div>
          </div>
        </div>

        {/* Nav Section Label */}
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '1.2px', padding: '0 8px', marginBottom: '8px' }}>
          NAVIGATION
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 12px',
                borderRadius: '12px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontFamily: 'Space Grotesk',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#0a0a0f' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-green)' : 'transparent',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 12px rgba(34,197,94,.25)' : 'none'
              })}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Box */}
        <div style={{
          marginTop: '20px',
          padding: '16px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px'
        }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, rgba(34,197,94,.2), rgba(34,197,94,.05))',
              border: '1px solid rgba(34,197,94,.3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '16px',
              color: 'var(--accent-green)'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '9px',
              background: 'rgba(239,68,68,.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,.2)',
              borderRadius: '9px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Space Grotesk',
              transition: 'background 0.15s'
            }}
            onMouseOver={(e) => (e.target.style.background = 'rgba(239,68,68,.2)')}
            onMouseOut={(e)  => (e.target.style.background = 'rgba(239,68,68,.1)')}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main style={{
        marginLeft: '255px',
        flex: 1,
        padding: '30px 32px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 255px)',
        overflowX: 'hidden'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
