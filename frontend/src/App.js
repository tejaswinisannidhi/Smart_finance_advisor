// ============================================================
// src/App.js - Root Component with Router & Providers
// ============================================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';

import Layout      from './components/layout/Layout';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIAdvisor   from './pages/AIAdvisor';
import Predictor   from './pages/Predictor';

// ── Loading Screen ───────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', background: '#0a0a0f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '16px'
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '24px', boxShadow: '0 8px 28px rgba(34,197,94,.3)'
    }}>💰</div>
    <div className="spinner" />
  </div>
);

// ── Protected Route: redirects to /login if not authenticated ─
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Public Route: redirects to /dashboard if already logged in ─
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// ── All App Routes ───────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes (inside Layout with sidebar) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="ai-advisor"   element={<AIAdvisor />} />
        <Route path="predictor"    element={<Predictor />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// ── Root App Component ───────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <AppRoutes />

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a26',
                color: '#f1f5f9',
                border: '1px solid #2d2d3d',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px'
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a26' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#1a1a26' } }
            }}
          />
        </Router>
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
