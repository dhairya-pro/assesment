const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return errorResponse(res, 'An account with this email already exists', 409);
  }

  // Create user
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });

  const token = generateToken(user._id);

  return successResponse(
    res,
    'Account created successfully',
    {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    },
    201
  );
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  return successResponse(res, 'Login successful', {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      preferences: user.preferences,
      stats: user.stats,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, 'User profile retrieved', {
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    preferences: user.preferences,
    stats: user.stats,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @access  Protected
 */
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { name, currentPassword, newPassword, preferences } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Update name
  if (name) user.name = name.trim();

  // Update preferences
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  // Change password
  if (newPassword) {
    if (!currentPassword) {
      return errorResponse(res, 'Current password is required to change password', 400);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
  }

  // Handle profile image upload
  if (req.file) {
    user.profileImage = `/uploads/${req.user._id}/${req.file.filename}`;
  }

  await user.save();

  return successResponse(res, 'Profile updated successfully', {
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    preferences: user.preferences,
    stats: user.stats,
  });
});

/**
 * @route   DELETE /api/auth/account
 * @access  Protected
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  return successResponse(res, 'Account deactivated successfully');
});

module.exports = { register, login, getMe, updateProfile, deleteAccount };
