const Location = require('../models/locations.model');

const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.findAllWithRisk();

        return res.status(200).json({
            count: locations.length,
            data: locations
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        return res.status(500).json({
            error: 'Failed to fetch locations'
        });
    }
};

const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const details = await Location.findByIdWithDetails(id);

        if (!details.location) {
            return res.status(404).json({
                error: 'Location not found'
            });
        }

        return res.status(200).json({
            data: details
        });
    } catch (error) {
        console.error('Error fetching location:', error);
        return res.status(500).json({
            error: 'Failed to fetch location'
        });
    }
};

const getLocationsByDistrict = async (req, res) => {
    try {
        const { district } = req.params;
        const locations = await Location.findByDistrict(district);

        return res.status(200).json({
            count: locations.length,
            data: locations
        });
    } catch (error) {
        console.error('Error fetching locations by district:', error);
        return res.status(500).json({
            error: 'Failed to fetch locations'
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

        const locations = await Location.findByRiskLevel(riskLevel);

        return res.status(200).json({
            count: locations.length,
            data: locations
        });
    } catch (error) {
        console.error('Error fetching locations by risk:', error);
        return res.status(500).json({
            error: 'Failed to fetch locations'
        });
    }
};

const createLocation = async (req, res) => {
    try {
        const { name, district, latitude, longitude, description } = req.body;

        if (!name || !district || !latitude || !longitude) {
            return res.status(400).json({
                error: 'Name, district, latitude, and longitude are required'
            });
        }

        const location = await Location.create({
            name,
            district,
            latitude,
            longitude,
            description
        });

        return res.status(201).json({
            message: 'Location created successfully',
            data: location
        });
    } catch (error) {
        console.error('Error creating location:', error);
        return res.status(500).json({
            error: 'Failed to create location'
        });
    }
};

const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const location = await Location.update(id, updates);

        if (!location) {
            return res.status(404).json({
                error: 'Location not found'
            });
        }

        return res.status(200).json({
            message: 'Location updated successfully',
            data: location
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return res.status(500).json({
            error: 'Failed to update location'
        });
    }
};

const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Location.delete(id);

        if (!deleted) {
            return res.status(404).json({
                error: 'Location not found'
            });
        }

        return res.status(200).json({
            message: 'Location deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        return res.status(500).json({
            error: 'Failed to delete location'
        });
    }
};

const getWeatherHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 24;

        const history = await Location.getWeatherHistory(id, limit);

        return res.status(200).json({
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

const getRiskHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const history = await Location.getRiskHistory(id, limit);

        return res.status(200).json({
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error fetching risk history:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk history'
        });
    }
};

const getDistricts = async (req, res) => {
    try {
        const districts = await Location.getDistricts();

        return res.status(200).json({
            data: districts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        return res.status(500).json({
            error: 'Failed to fetch districts'
        });
    }
};

const getHistoricalFloods = async (req, res) => {
    try {
        const { id } = req.params;
        const floods = await Location.getHistoricalFloods(id);

        return res.status(200).json({
            count: floods.length,
            data: floods
        });
    } catch (error) {
        console.error('Error fetching historical floods:', error);
        return res.status(500).json({
            error: 'Failed to fetch historical floods'
        });
    }
};

module.exports = {
    getAllLocations,
    getLocationById,
    getLocationsByDistrict,
    getLocationsByRisk,
    createLocation,
    updateLocation,
    deleteLocation,
    getWeatherHistory,
    getRiskHistory,
    getHistoricalFloods,
    getDistricts
};