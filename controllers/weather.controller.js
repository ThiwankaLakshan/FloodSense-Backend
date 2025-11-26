const Weather = require('../models/weather.model');

const getWeatherHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '7d' } = req.query;

        const validPeriods = ['24h', '7d', '30d', '90d'];
        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                error: 'Invalid period. Use: 24h, 7d, 30d, or 90d'
            });
        }

        const history = await Weather.getHistory(id, period);

        return res.status(200).json({
            period,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error fetching weather history:', error);
        return res.status(500).json({
            error: 'Failed to fetch weather history'
        });
    }
};

const getCurrentWeather = async (req, res) => {
    try {
        const { id } = req.params;

        const weather = await Weather.getCurrent(id);

        if (!weather) {
            return res.status(404).json({
                error: 'No weather data found for this location'
            });
        }

        return res.status(200).json({
            data: weather
        });
    } catch (error) {
        console.error('Error fetching current weather:', error);
        return res.status(500).json({
            error: 'Failed to fetch weather data'
        });
    }
};

const getAllCurrentWeather = async (req, res) => {
    try {
        const weather = await Weather.getLatestForAll();

        return res.status(200).json({
            count: weather.length,
            data: weather
        });
    } catch (error) {
        console.error('Error fetching all weather data:', error);
        return res.status(500).json({
            error: 'Failed to fetch weather data'
        });
    }
};

const getWeatherStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '7d' } = req.query;

        const stats = await Weather.getStats(id, period);

        return res.status(200).json({
            period,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching weather stats:', error);
        return res.status(500).json({
            error: 'Failed to fetch weather statistics'
        });
    }
};

const getRainfallTrend = async (req, res) => {
    try {
        const { id } = req.params;
        const { hours = 24 } = req.query;

        const trend = await Weather.getRainfallTrend(id, parseInt(hours));

        return res.status(200).json({
            hours: parseInt(hours),
            count: trend.length,
            data: trend
        });
    } catch (error) {
        console.error('Error fetching rainfall trend:', error);
        return res.status(500).json({
            error: 'Failed to fetch rainfall trend'
        });
    }
};

const getHourlyRainfall = async (req, res) => {
    try {
        const { id } = req.params;
        const { hours = 24 } = req.query;

        const rainfall = await Weather.getHourlyRainfall(id, parseInt(hours));

        return res.status(200).json({
            hours: parseInt(hours),
            count: rainfall.length,
            data: rainfall
        });
    } catch (error) {
        console.error('Error fetching hourly rainfall:', error);
        return res.status(500).json({
            error: 'Failed to fetch rainfall data'
        });
    }
};

const getAlertConditions = async (req, res) => {
    try {
        const alerts = await Weather.getAlertConditions();

        return res.status(200).json({
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching alert conditions:', error);
        return res.status(500).json({
            error: 'Failed to fetch alert conditions'
        });
    }
};

const compareLocations = async (req, res) => {
    try {
        const { locationIds } = req.body;
        const { period = '24h' } = req.query;

        if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
            return res.status(400).json({
                error: 'locationIds array is required'
            });
        }

        const comparison = await Weather.compareLocations(locationIds, period);

        return res.status(200).json({
            period,
            count: comparison.length,
            data: comparison
        });
    } catch (error) {
        console.error('Error comparing locations:', error);
        return res.status(500).json({
            error: 'Failed to compare locations'
        });
    }
};

const createWeatherData = async (req, res) => {
    try {
        const weatherData = req.body;

        if (!weatherData.location_id) {
            return res.status(400).json({
                error: 'location_id is required'
            });
        }

        const weather = await Weather.create(weatherData);

        return res.status(201).json({
            message: 'Weather data created successfully',
            data: weather
        });
    } catch (error) {
        console.error('Error creating weather data:', error);
        return res.status(500).json({
            error: 'Failed to create weather data'
        });
    }
};

const bulkCreateWeatherData = async (req, res) => {
    try {
        const { weatherData } = req.body;

        if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
            return res.status(400).json({
                error: 'weatherData array is required'
            });
        }

        const created = await Weather.bulkCreate(weatherData);

        return res.status(201).json({
            message: 'Weather data created successfully',
            count: created.length
        });
    } catch (error) {
        console.error('Error bulk creating weather data:', error);
        return res.status(500).json({
            error: 'Failed to create weather data'
        });
    }
};

module.exports = {
    getWeatherHistory,
    getCurrentWeather,
    getAllCurrentWeather,
    getWeatherStats,
    getRainfallTrend,
    getHourlyRainfall,
    getAlertConditions,
    compareLocations,
    createWeatherData,
    bulkCreateWeatherData
};