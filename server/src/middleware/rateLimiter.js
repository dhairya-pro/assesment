const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Auth-specific rate limiter — 10 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Upload rate limiter — 20 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. You can upload up to 20 times per hour.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * AI generation rate limiter — 10 generations per hour
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI generation limit reached. You can generate up to 10 itineraries per hour.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { generalLimiter, authLimiter, uploadLimiter, aiLimiter };
