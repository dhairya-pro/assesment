/**
 * Async handler wrapper — eliminates try-catch boilerplate in controllers
 * @param {Function} fn - The async controller function
 * @returns {Function} - Express middleware with error forwarding
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
