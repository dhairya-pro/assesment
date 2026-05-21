const QRCode = require('qrcode');
const Itinerary = require('../models/Itinerary');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../config/logger');

/**
 * @route   POST /api/share/:id
 * @access  Protected — Create or get share link
 */
const createShareLink = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  if (itinerary.status !== 'completed') {
    return errorResponse(res, 'Only completed itineraries can be shared', 400);
  }

  // Generate share token if not exists
  if (!itinerary.shareToken) {
    itinerary.generateShareToken();
  } else {
    itinerary.isPublic = true;
  }

  await itinerary.save();

  const shareUrl = `${process.env.CLIENT_URL}/share/${itinerary.shareToken}`;

  return successResponse(res, 'Share link created', {
    shareToken: itinerary.shareToken,
    shareUrl,
    isPublic: itinerary.isPublic,
  });
});

/**
 * @route   DELETE /api/share/:id
 * @access  Protected — Revoke share link
 */
const revokeShareLink = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  itinerary.isPublic = false;
  await itinerary.save();

  return successResponse(res, 'Share link revoked. Itinerary is now private.');
});

/**
 * @route   GET /api/share/:token
 * @access  Public — View shared itinerary
 */
const getSharedItinerary = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const itinerary = await Itinerary.findOne({
    shareToken: token,
    isPublic: true,
  }).select('-userId -documents -extractedData.rawSummary -aiPromptUsed');

  if (!itinerary) {
    return errorResponse(res, 'Shared itinerary not found or has been made private', 404);
  }

  // Increment view count
  await Itinerary.updateOne({ _id: itinerary._id }, { $inc: { shareViews: 1 } });

  return successResponse(res, 'Shared itinerary retrieved', { itinerary });
});

/**
 * @route   GET /api/share/:id/qr
 * @access  Protected — Generate QR code for itinerary
 */
const generateQRCode = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });

  if (!itinerary) {
    return errorResponse(res, 'Itinerary not found', 404);
  }

  if (!itinerary.isPublic || !itinerary.shareToken) {
    return errorResponse(res, 'Please create a share link first', 400);
  }

  const shareUrl = `${process.env.CLIENT_URL}/share/${itinerary.shareToken}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    return successResponse(res, 'QR code generated', { qrCode: qrDataUrl, shareUrl });
  } catch (error) {
    logger.error(`QR generation failed: ${error.message}`);
    return errorResponse(res, 'QR code generation failed', 500);
  }
});

module.exports = { createShareLink, revokeShareLink, getSharedItinerary, generateQRCode };
