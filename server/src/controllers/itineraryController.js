const { validationResult } = require('express-validator');
const Itinerary = require('../models/Itinerary');
const Document = require('../models/Document');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateItinerary, generateTripSummary, generateChatResponse } = require('../services/aiService');
const { consolidateExtractedData } = require('../services/ocrService');
const logger = require('../config/logger');

/**
 * @route   POST /api/itinerary/generate
 * @access  Protected
 */
const generate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { documentIds, title, additionalContext } = req.body;

  // Fetch documents
  const documents = await Document.find({
    _id: { $in: documentIds },
    userId: req.user._id,
  });

  if (documents.length === 0) {
    return errorResponse(res, 'No valid documents found', 404);
  }

  // Consolidate all extracted data
  const extractedData = consolidateExtractedData(documents);

  // Determine destination
  const destination =
    extractedData.flights[0]?.to ||
    extractedData.hotels[0]?.name ||
    'International Destination';

  // Create itinerary document
  const itinerary = await Itinerary.create({
    userId: req.user._id,
    title: title || `Trip to ${destination}`,
    destination,
    documents: documentIds,
    extractedData,
    status: 'processing',
    tripDates: {
      start: extractedData.flights[0]?.departure || '',
      end: extractedData.flights[extractedData.flights.length - 1]?.arrival || '',
    },
  });

  try {
    logger.info(`Generating AI itinerary for: ${itinerary._id}`);

    // Generate with AI
    const aiResult = await generateItinerary(extractedData, additionalContext);

    const structured = aiResult.structured;

    // Store AI results
    itinerary.aiItinerary = {
      rawContent: aiResult.rawContent,
      dayPlans: structured.dayPlans || [],
      overview: structured.overview || '',
      flightDetails: structured.flightDetails || '',
      accommodationDetails: structured.accommodationDetails || '',
      localTransport: structured.localTransport || '',
      attractions: structured.attractions || [],
      foodRecommendations: structured.foodRecommendations || [],
      weatherTips: structured.weatherTips || '',
      packingList: structured.packingList || [],
      budgetSummary: structured.budgetSummary || {},
      travelChecklist: structured.travelChecklist || [],
      emergencyNotes: structured.emergencyNotes || '',
      generatedAt: new Date(),
    };

    // Update destination from AI if available
    if (structured.destination) {
      itinerary.destination = structured.destination;
    }

    if (structured.tripDuration) {
      itinerary.title = title || `${structured.destination || destination} — ${structured.tripDuration}`;
    }

    itinerary.status = 'completed';
    await itinerary.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalTrips': 1 },
    });

    // Link documents to itinerary
    await Document.updateMany(
      { _id: { $in: documentIds } },
      { $set: { itineraryId: itinerary._id } }
    );

    logger.info(`Itinerary generated successfully: ${itinerary._id}`);

    return successResponse(res, 'Itinerary generated successfully', { itinerary }, 201);
  } catch (error) {
    logger.error(`AI generation failed for itinerary ${itinerary._id}: ${error.message}`);

    itinerary.status = 'failed';
    itinerary.generationError = error.message;
    await itinerary.save();

    return errorResponse(res, `AI generation failed: ${error.message}`, 500);
  }
});

/**
 * @route   GET /api/itinerary
 * @access  Protected
 */
const getAllItineraries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    destination = '',
    favorite,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = { userId: req.user._id };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];
  }

  if (destination) {
    query.destination = { $regex: destination, $options: 'i' };
  }

  if (favorite === 'true') {
    query.isFavorite = true;
  }

  const total = await Itinerary.countDocuments(query);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const itineraries = await Itinerary.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select('-aiItinerary.rawContent -aiItinerary.dayPlans -extractedData.rawSummary')
    .lean();

  return paginatedResponse(res, 'Itineraries retrieved', itineraries, page, limit, total);
});

/**
 * @route   GET /api/itinerary/:id
 * @access  Protected
 */
const getItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('documents', 'originalName mimeType size documentType parsedData ocrStatus');

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  return successResponse(res, 'Itinerary retrieved', { itinerary });
});

/**
 * @route   PUT /api/itinerary/:id
 * @access  Protected
 */
const updateItinerary = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { title, isFavorite, tags } = req.body;

  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  if (title !== undefined) itinerary.title = title;
  if (isFavorite !== undefined) itinerary.isFavorite = isFavorite;
  if (tags !== undefined) itinerary.tags = tags;

  await itinerary.save();

  return successResponse(res, 'Itinerary updated', { itinerary });
});

/**
 * @route   DELETE /api/itinerary/:id
 * @access  Protected
 */
const deleteItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  await Itinerary.deleteOne({ _id: itinerary._id });

  // Decrement user trip count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'stats.totalTrips': -1 },
  });

  return successResponse(res, 'Itinerary deleted successfully');
});

/**
 * @route   PATCH /api/itinerary/:id/favorite
 * @access  Protected
 */
const toggleFavorite = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  itinerary.isFavorite = !itinerary.isFavorite;
  await itinerary.save();

  return successResponse(
    res,
    itinerary.isFavorite ? 'Added to favorites' : 'Removed from favorites',
    { isFavorite: itinerary.isFavorite }
  );
});

/**
 * @route   POST /api/itinerary/:id/regenerate
 * @access  Protected
 */
const regenerateItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  const { additionalContext } = req.body;

  itinerary.status = 'processing';
  await itinerary.save();

  try {
    const aiResult = await generateItinerary(itinerary.extractedData, additionalContext);
    const structured = aiResult.structured;

    itinerary.aiItinerary = {
      rawContent: aiResult.rawContent,
      dayPlans: structured.dayPlans || [],
      overview: structured.overview || '',
      flightDetails: structured.flightDetails || '',
      accommodationDetails: structured.accommodationDetails || '',
      localTransport: structured.localTransport || '',
      attractions: structured.attractions || [],
      foodRecommendations: structured.foodRecommendations || [],
      weatherTips: structured.weatherTips || '',
      packingList: structured.packingList || [],
      budgetSummary: structured.budgetSummary || {},
      travelChecklist: structured.travelChecklist || [],
      emergencyNotes: structured.emergencyNotes || '',
      generatedAt: new Date(),
    };

    itinerary.status = 'completed';
    await itinerary.save();

    return successResponse(res, 'Itinerary regenerated successfully', { itinerary });
  } catch (error) {
    itinerary.status = 'failed';
    itinerary.generationError = error.message;
    await itinerary.save();
    return errorResponse(res, `Regeneration failed: ${error.message}`, 500);
  }
});

/**
 * @route   POST /api/itinerary/:id/chat
 * @access  Protected
 */
const chatWithItinerary = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return errorResponse(res, 'Question is required', 400);
  }

  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  const context = `Destination: ${itinerary.destination}, Overview: ${itinerary.aiItinerary?.overview || ''}`;
  const response = await generateChatResponse(question, context);

  return successResponse(res, 'Chat response generated', { response });
});

/**
 * @route   GET /api/itinerary/stats
 * @access  Protected
 */
const getStats = asyncHandler(async (req, res) => {
  const [total, favorites, byDestination] = await Promise.all([
    Itinerary.countDocuments({ userId: req.user._id }),
    Itinerary.countDocuments({ userId: req.user._id, isFavorite: true }),
    Itinerary.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return successResponse(res, 'Stats retrieved', {
    totalItineraries: total,
    favorites,
    topDestinations: byDestination,
  });
});

module.exports = {
  generate,
  getAllItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  toggleFavorite,
  regenerateItinerary,
  chatWithItinerary,
  getStats,
};
