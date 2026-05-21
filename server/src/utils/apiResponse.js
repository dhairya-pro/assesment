/**
 * Standard API response helpers for consistent JSON structure
 */

/**
 * Success response
 */
const successResponse = (res, message, data = null, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};

/**
 * Error response
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) response.errors = errors;

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 */
const paginatedResponse = (res, message, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
