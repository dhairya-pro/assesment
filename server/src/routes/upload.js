const express = require('express');
const router = express.Router();
const { uploadDocuments, getUserDocuments, getDocument, deleteDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(protect);

router.post('/', uploadLimiter, upload.array('documents', 10), uploadDocuments);
router.get('/', getUserDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
