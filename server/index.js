const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/config/db');
const logger = require('./src/config/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { authLimiter, generalLimiter } = require('./src/middleware/rateLimiter');

// Route imports
const authRoutes = require('./src/routes/auth');
const uploadRoutes = require('./src/routes/upload');
const ocrRoutes = require('./src/routes/ocr');
const itineraryRoutes = require('./src/routes/itinerary');
const shareRoutes = require('./src/routes/share');

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB query sanitization (prevent NoSQL injection)
app.use(mongoSanitize());

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// Rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/share', shareRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on ${HOST}:${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`📖 Health: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown on unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => {
    logger.info('Server closed due to unhandled rejection');
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
