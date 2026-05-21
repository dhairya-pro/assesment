const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/authValidator');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, upload.single('profileImage'), updateProfile);
router.delete('/account', protect, deleteAccount);

module.exports = router;
