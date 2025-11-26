const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locations.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/districts', locationController.getDistricts);
router.get('/:id', locationController.getLocationById);
router.get('/:id/weather-history', locationController.getWeatherHistory);
router.get('/:id/risk-history', locationController.getRiskHistory);
router.get('/district/:district', locationController.getLocationsByDistrict);
router.get('/risk/:riskLevel', locationController.getLocationsByRisk);

// Protected routes (admin only)
router.post('/', verifyToken, locationController.createLocation);
router.put('/:id', verifyToken, locationController.updateLocation);
router.delete('/:id', verifyToken, locationController.deleteLocation);

module.exports = router;