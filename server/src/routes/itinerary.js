const express = require('express');
const router = express.Router();
const {
  generate,
  getAllItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  toggleFavorite,
  regenerateItinerary,
  chatWithItinerary,
  getStats,
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');
const { generateItineraryValidator, updateItineraryValidator } = require('../validators/itineraryValidator');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

// Stats
router.get('/stats', getStats);

// CRUD
router.post('/generate', aiLimiter, generateItineraryValidator, generate);
router.get('/', getAllItineraries);
router.get('/:id', getItinerary);
router.put('/:id', updateItineraryValidator, updateItinerary);
router.delete('/:id', deleteItinerary);

// Actions
router.patch('/:id/favorite', toggleFavorite);
router.post('/:id/regenerate', aiLimiter, regenerateItinerary);
router.post('/:id/chat', chatWithItinerary);

module.exports = router;
