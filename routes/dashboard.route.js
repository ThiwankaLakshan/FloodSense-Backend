const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All dashboard routes require authentication
router.use(verifyToken);

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getSummary);

// GET /api/dashboard/risk-distribution
router.get('/risk-distribution', dashboardController.getRiskDistribution);

// GET /api/dashboard/locations/:riskLevel
router.get('/locations/:riskLevel', dashboardController.getLocationsByRisk);

// GET /api/dashboard/alerts
router.get('/alerts', dashboardController.getActiveAlerts);

// GET /api/dashboard/weather-trends/:locationId
router.get('/weather-trends/:locationId', dashboardController.getWeatherTrends);

module.exports = router;