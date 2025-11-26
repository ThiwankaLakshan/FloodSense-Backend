const Dashboard = require('../models/dashboard.model');

const getSummary = async (req, res) => {
    try {
        const summary = await Dashboard.getSummary();

        return res.status(200).json({
            data: summary
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return res.status(500).json({
            error: 'Failed to fetch dashboard summary'
        });
    }
};

const getRiskDistribution = async (req, res) => {
    try {
        const distribution = await Dashboard.getRiskDistribution();

        return res.status(200).json({
            data: distribution
        });
    } catch (error) {
        console.error('Error fetching risk distribution:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk distribution'
        });
    }
};

const getLocationsByRisk = async (req, res) => {
    try {
        const { riskLevel } = req.params;

        if (!['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].includes(riskLevel)) {
            return res.status(400).json({
                error: 'Invalid risk level'
            });
        }

        const locations = await Dashboard.getLocationsByRiskLevel(riskLevel);

        return res.status(200).json({
            data: locations
        });
    } catch (error) {
        console.error('Error fetching locations by risk:', error);
        return res.status(500).json({
            error: 'Failed to fetch locations'
        });
    }
};

const getActiveAlerts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const alerts = await Dashboard.getRecentAlerts(limit);

        return res.status(200).json({
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching active alerts:', error);
        return res.status(500).json({
            error: 'Failed to fetch alerts'
        });
    }
};

const getWeatherTrends = async (req, res) => {
    try {
        const { locationId } = req.params;
        const hours = parseInt(req.query.hours) || 24;

        const trends = await Dashboard.getWeatherTrends(locationId, hours);

        return res.status(200).json({
            data: trends
        });
    } catch (error) {
        console.error('Error fetching weather trends:', error);
        return res.status(500).json({
            error: 'Failed to fetch weather trends'
        });
    }
};

module.exports = {
    getSummary,
    getRiskDistribution,
    getLocationsByRisk,
    getActiveAlerts,
    getWeatherTrends
};