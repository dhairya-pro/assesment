const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * @route   POST /api/upload
 * @access  Protected
 */
const uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, 'No files uploaded', 400);
  }

  const uploadedDocs = [];

  for (const file of req.files) {
    const doc = await Document.create({
      userId: req.user._id,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      ocrStatus: 'pending',
    });

    uploadedDocs.push({
      _id: doc._id,
      originalName: doc.originalName,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      ocrStatus: doc.ocrStatus,
      url: `/uploads/${req.user._id}/${file.filename}`,
      createdAt: doc.createdAt,
    });
  }

  return successResponse(
    res,
    `${uploadedDocs.length} file(s) uploaded successfully`,
    { documents: uploadedDocs },
    201
  );
});

/**
 * @route   GET /api/upload
 * @access  Protected
 */
const getUserDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const total = await Document.countDocuments({ userId: req.user._id });
  const documents = await Document.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select('-extractedText');

  const docsWithUrls = documents.map((doc) => ({
    ...doc.toObject(),
    url: `/uploads/${req.user._id}/${doc.filename}`,
  }));

  return paginatedResponse(res, 'Documents retrieved', docsWithUrls, page, limit, total);
});

/**
 * @route   GET /api/upload/:id
 * @access  Protected
 */
const getDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });

  if (!doc) {
    return errorResponse(res, 'Document not found', 404);
  }

  return successResponse(res, 'Document retrieved', {
    ...doc.toObject(),
    url: `/uploads/${req.user._id}/${doc.filename}`,
  });
});

/**
 * @route   DELETE /api/upload/:id
 * @access  Protected
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });

  if (!doc) {
    return errorResponse(res, 'Document not found', 404);
  }

  // Delete physical file
  if (fs.existsSync(doc.path)) {
    fs.unlinkSync(doc.path);
  }

  await Document.deleteOne({ _id: doc._id });

  return successResponse(res, 'Document deleted successfully');
});

module.exports = { uploadDocuments, getUserDocuments, getDocument, deleteDocument };
