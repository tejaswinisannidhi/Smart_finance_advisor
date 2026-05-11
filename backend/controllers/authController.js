// ============================================================
// controllers/authController.js - Auth Business Logic
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate JWT Token ───────────────────────────────
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );
};

// ── Helper: Format user response (no password) ───────────────
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

// ============================================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ============================================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Send response with token
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: generateToken(user._id),
      user: formatUser(user)
    });

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ============================================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Send response with token
    res.json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user._id),
      user: formatUser(user)
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ============================================================
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ============================================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.json({
      success: true,
      user: formatUser(req.user)
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
