const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'ai-travel',
        serverSelectionTimeoutMS: 10000,
      });

      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting reconnect...');
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });

      return; // success
    } catch (error) {
      logger.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        logger.info(`Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 1.5, 15000); // exponential backoff, max 15s
      } else {
        logger.error('All MongoDB connection attempts failed. Server will run without DB — routes requiring DB will return errors.');
        // Do NOT exit — let the HTTP server keep running
      }
    }
  }
};

module.exports = connectDB;

