const { body, param } = require('express-validator');

const generateItineraryValidator = [
  body('documentIds')
    .isArray({ min: 1 })
    .withMessage('At least one document ID is required'),

  body('documentIds.*')
    .isMongoId()
    .withMessage('Each document ID must be a valid MongoDB ObjectId'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),

  body('additionalContext')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Additional context cannot exceed 1000 characters'),
];

const updateItineraryValidator = [
  param('id').isMongoId().withMessage('Invalid itinerary ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),

  body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),

  body('tags').optional().isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be a string under 30 characters'),
];

module.exports = { generateItineraryValidator, updateItineraryValidator };
