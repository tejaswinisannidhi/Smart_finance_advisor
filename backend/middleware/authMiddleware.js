// ============================================================
// middleware/authMiddleware.js - JWT Authentication Middleware
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect Route Middleware ─────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];

      // Verify token using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by decoded ID and attach to request (without password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found. Token is invalid.' });
      }

      // Continue to next middleware
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please login again.' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please login again.' });
      }
      return res.status(401).json({ message: 'Not authorized.' });
    }
  }

  // No token provided
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. No token provided.' });
  }
};

module.exports = { protect };
