const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/current', weatherController.getAllCurrentWeather);
router.get('/alerts', weatherController.getAlertConditions);
router.get('/:id/current', weatherController.getCurrentWeather);
router.get('/:id/history', weatherController.getWeatherHistory);
router.get('/:id/stats', weatherController.getWeatherStats);
router.get('/:id/rainfall-trend', weatherController.getRainfallTrend);
router.get('/:id/hourly-rainfall', weatherController.getHourlyRainfall);
router.post('/compare', weatherController.compareLocations);

// Protected routes (admin/system only)
router.post('/', verifyToken, weatherController.createWeatherData);
router.post('/bulk', verifyToken, weatherController.bulkCreateWeatherData);

module.exports = router;