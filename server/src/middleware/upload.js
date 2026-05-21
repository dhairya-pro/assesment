const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organize by user ID
    const userDir = path.join(uploadDir, req.user ? req.user._id.toString() : 'temp');
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4().replace(/-/g, '').substring(0, 12);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .replace(/\.+/g, '.')
      .substring(0, 50);
    cb(null, `${uniqueId}_${safeName}`);
  },
});

// Allowed file types
const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      'Invalid file type. Only PNG, JPG, JPEG, WEBP, and PDF files are allowed'
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 10, // Max 10 files per request
  },
});

module.exports = upload;
