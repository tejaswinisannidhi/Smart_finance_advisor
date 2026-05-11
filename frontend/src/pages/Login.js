// ============================================================
// src/pages/Login.js - Login Page
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(34,197,94,.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(59,130,246,.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div className="page-wrapper" style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo & heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 18px',
            boxShadow: '0 8px 28px rgba(34,197,94,.35)'
          }}>💰</div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Sign in to your finance dashboard
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '18px' }}>
              <label>Email address</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label>Password</label>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
              Register free →
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: '16px',
          padding: '14px 18px',
          background: 'rgba(34,197,94,.05)',
          border: '1px solid rgba(34,197,94,.15)',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}>
          💡 <strong style={{ color: 'var(--text-primary)' }}>Demo account:</strong>{' '}
          aryan@demo.com / password123
          <br />
          <span style={{ fontSize: '12px' }}>(Run <code style={{ background: 'var(--bg-input)', padding: '1px 5px', borderRadius: '4px' }}>npm run seed</code> in backend first)</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
