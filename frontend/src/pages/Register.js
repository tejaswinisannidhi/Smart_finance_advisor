// ============================================================
// src/pages/Register.js - Registration Page
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Let\'s get started 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Try again.');
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
        position: 'absolute', top: '-150px', left: '-150px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(34,197,94,.06) 0%, transparent 70%)',
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
          }}>🌱</div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Start your financial journey today — it's free!
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '18px' }}>
              <label>Full Name</label>
              <input
                className="input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Aryan Sharma"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label>Email address</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label>Password</label>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label>Confirm Password</label>
              <input
                className="input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {loading ? '⏳ Creating account...' : '✨ Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
              Sign in →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
