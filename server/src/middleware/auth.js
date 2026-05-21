const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to protect routes — verifies JWT and attaches user to req
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized — no token provided', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 'User no longer exists', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired — please log in again', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    return errorResponse(res, 'Authentication failed', 401);
  }
});

/**
 * Optional auth — attaches user if token exists, but doesn't block
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Don't block — just continue without user
      req.user = null;
    }
  }

  next();
});

module.exports = { protect, optionalAuth };
