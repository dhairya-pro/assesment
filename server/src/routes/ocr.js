const express = require('express');
const router = express.Router();
const { extractDocumentData, extractBatch, updateExtractedData } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/extract/:documentId', extractDocumentData);
router.post('/extract-batch', extractBatch);
router.put('/:documentId', updateExtractedData);

module.exports = router;
