const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

// Public routes (no auth required)
router.get('/active', alertController.getActiveAlerts);
router.get('/recent', alertController.getRecentAlerts);
router.get('/stats', alertController.getAlertStats);



// GET /api/alerts - Get all alerts
router.get('/', alertController.getAllAlerts);

// GET /api/alerts/:id - Get alert by ID
router.get('/:id', alertController.getAlertById);

// GET /api/alerts/location/:locationId - Get alerts by location
router.get('/location/:locationId', alertController.getAlertsByLocation);

// GET /api/alerts/risk/:riskLevel - Get alerts by risk level
router.get('/risk/:riskLevel', alertController.getAlertsByRiskLevel);

// POST /api/alerts - Create alert
router.post('/', alertController.createAlert);

// POST /api/alerts/bulk - Bulk create alerts
router.post('/bulk', alertController.bulkCreateAlerts);

// PUT /api/alerts/:id/status - Update alert status
router.put('/:id/status', alertController.updateAlertStatus);

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', alertController.deleteAlert);

module.exports = router;