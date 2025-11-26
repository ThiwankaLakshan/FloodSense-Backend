const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskAssessment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/', riskController.getAllRiskAssessments);
router.get('/level/:riskLevel', riskController.getByRiskLevel);
router.get('/:id/history', riskController.getRiskHistory);
router.get('/:id/latest', riskController.getLatestRisk);
router.get('/:id/trend', riskController.getRiskTrend);
router.get('/:id/stats', riskController.getRiskStats);

// Protected routes (admin only)
router.post('/', verifyToken, riskController.createRiskAssessment);

module.exports = router;