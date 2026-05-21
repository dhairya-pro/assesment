const express = require('express');
const router = express.Router();
const { createShareLink, revokeShareLink, getSharedItinerary, generateQRCode } = require('../controllers/shareController');
const { protect } = require('../middleware/auth');

// Public route — no auth needed to view shared itinerary
router.get('/:token', getSharedItinerary);

// Protected routes
router.use(protect);
router.post('/:id/create', createShareLink);
router.delete('/:id/revoke', revokeShareLink);
router.get('/:id/qr', generateQRCode);

module.exports = router;
