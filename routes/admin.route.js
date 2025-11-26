// routes/admin.routes.js (updated)
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', adminController.login);
router.post('/refresh-token', adminController.refreshToken);

// Protected routes
router.get('/verify', verifyToken, adminController.verify);
router.get('/profile', verifyToken, adminController.getProfile);

module.exports = router;