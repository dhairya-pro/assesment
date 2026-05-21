const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { extractText, parseTravelData } = require('../services/ocrService');
const logger = require('../config/logger');

/**
 * @route   POST /api/ocr/extract/:documentId
 * @access  Protected
 */
const extractDocumentData = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user._id });

  if (!doc) {
    return errorResponse(res, 'Document not found', 404);
  }

  if (doc.ocrStatus === 'processing') {
    return errorResponse(res, 'OCR is already in progress for this document', 400);
  }

  // Update status to processing
  doc.ocrStatus = 'processing';
  await doc.save();

  try {
    logger.info(`Starting OCR for document: ${doc._id} (${doc.originalName})`);

    // Extract raw text
    const result = await extractText(doc.path, doc.mimeType);

    // Parse structured data from text
    const parsedData = parseTravelData(result.text);

    // Update document
    doc.extractedText = result.text;
    doc.parsedData = { ...parsedData };
    doc.ocrStatus = result.error ? 'failed' : 'completed';
    doc.ocrConfidence = result.confidence;
    doc.ocrError = result.error || null;

    // Auto-detect document type
    if (parsedData.documentType) {
      doc.documentType = parsedData.documentType;
    }

    await doc.save();

    logger.info(
      `OCR completed for document: ${doc._id} — status: ${doc.ocrStatus}, confidence: ${result.confidence}%`
    );

    return successResponse(res, 'OCR extraction completed', {
      _id: doc._id,
      extractedText: doc.extractedText,
      parsedData: doc.parsedData,
      ocrStatus: doc.ocrStatus,
      ocrConfidence: doc.ocrConfidence,
      documentType: doc.documentType,
      ocrError: doc.ocrError,
    });
  } catch (error) {
    logger.error(`OCR failed for document ${doc._id}: ${error.message}`);

    doc.ocrStatus = 'failed';
    doc.ocrError = error.message;
    await doc.save();

    return errorResponse(res, `OCR extraction failed: ${error.message}`, 500);
  }
});

/**
 * @route   POST /api/ocr/extract-batch
 * @access  Protected — Extract OCR for multiple documents
 */
const extractBatch = asyncHandler(async (req, res) => {
  const { documentIds } = req.body;

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return errorResponse(res, 'Document IDs array is required', 400);
  }

  const docs = await Document.find({
    _id: { $in: documentIds },
    userId: req.user._id,
  });

  if (docs.length === 0) {
    return errorResponse(res, 'No documents found', 404);
  }

  const results = [];

  for (const doc of docs) {
    try {
      doc.ocrStatus = 'processing';
      await doc.save();

      const result = await extractText(doc.path, doc.mimeType);
      const parsedData = parseTravelData(result.text);

      doc.extractedText = result.text;
      doc.parsedData = { ...parsedData };
      doc.ocrStatus = result.error ? 'failed' : 'completed';
      doc.ocrConfidence = result.confidence;
      doc.ocrError = result.error || null;

      if (parsedData.documentType) {
        doc.documentType = parsedData.documentType;
      }

      await doc.save();

      results.push({
        _id: doc._id,
        originalName: doc.originalName,
        ocrStatus: doc.ocrStatus,
        parsedData: doc.parsedData,
        ocrConfidence: doc.ocrConfidence,
      });
    } catch (error) {
      logger.error(`OCR batch failed for ${doc._id}: ${error.message}`);
      doc.ocrStatus = 'failed';
      doc.ocrError = error.message;
      await doc.save();
      results.push({
        _id: doc._id,
        originalName: doc.originalName,
        ocrStatus: 'failed',
        error: error.message,
      });
    }
  }

  return successResponse(res, `OCR completed for ${results.length} documents`, { results });
});

/**
 * @route   PUT /api/ocr/:documentId
 * @access  Protected — Update extracted data manually
 */
const updateExtractedData = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user._id });

  if (!doc) {
    return errorResponse(res, 'Document not found', 404);
  }

  const { parsedData, documentType } = req.body;

  if (parsedData) {
    doc.parsedData = { ...doc.parsedData, ...parsedData };
  }

  if (documentType) {
    const allowedTypes = ['flight', 'hotel', 'train', 'bus', 'visa', 'other'];
    if (allowedTypes.includes(documentType)) {
      doc.documentType = documentType;
    }
  }

  await doc.save();

  return successResponse(res, 'Document data updated successfully', {
    _id: doc._id,
    parsedData: doc.parsedData,
    documentType: doc.documentType,
  });
});

module.exports = { extractDocumentData, extractBatch, updateExtractedData };
