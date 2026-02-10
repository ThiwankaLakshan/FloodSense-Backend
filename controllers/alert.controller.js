const Alert = require('../models/alert.model');
const logger = require('../utils/logger.util');

const getAllAlerts = async (req, res) => {
    try {
        const { status, limit, offset } = req.query;
        
        const alerts = await Alert.findAll({
            status,
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0
        });

        return res.status(200).json({
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        logger.error('Error fetching alerts:', error);
        return res.status(500).json({
            error: 'Failed to fetch alerts'
        });
    }
};

const getActiveAlerts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const alerts = await Alert.findActive(limit);

        return res.status(200).json({
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        logger.error('Error fetching active alerts:', error);
        return res.status(500).json({
            error: 'Failed to fetch active alerts'
        });
    }
};

const getAlertById = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findById(id);

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        return res.status(200).json({
            data: alert
        });
    } catch (error) {
        logger.error('Error fetching alert:', error);
        return res.status(500).json({
            error: 'Failed to fetch alert'
        });
    }
};

const getAlertsByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        
        const alerts = await Alert.findByLocation(locationId, limit);

        return res.status(200).json({
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        logger.error('Error fetching alerts by location:', error);
        return res.status(500).json({
            error: 'Failed to fetch alerts'
        });
    }
};

const getAlertsByRiskLevel = async (req, res) => {
    try {
        const { riskLevel } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const validLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
        if (!validLevels.includes(riskLevel)) {
            return res.status(400).json({
                error: 'Invalid risk level'
            });
        }

        const alerts = await Alert.findByRiskLevel(riskLevel, limit);

        return res.status(200).json({
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        logger.error('Error fetching alerts by risk level:', error);
        return res.status(500).json({
            error: 'Failed to fetch alerts'
        });
    }
};

const getRecentAlerts = async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const limit = parseInt(req.query.limit) || 100;

        const alerts = await Alert.findRecent(hours, limit);

        return res.status(200).json({
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        logger.error('Error fetching recent alerts:', error);
        return res.status(500).json({
            error: 'Failed to fetch recent alerts'
        });
    }
};

const createAlert = async (req, res) => {
    try {
        const {
            location_id,
            risk_assessment_id,
            alert_type,
            recipient,
            message,
            status
        } = req.body;

        // Validation
        if (!location_id) {
            return res.status(400).json({
                error: 'location_id is required'
            });
        }

        if (!recipient) {
            return res.status(400).json({
                error: 'recipient is required'
            });
        }

        if (!message) {
            return res.status(400).json({
                error: 'message is required'
            });
        }

        const alert = await Alert.create({
            location_id,
            risk_assessment_id,
            alert_type: alert_type || 'SMS',
            recipient,
            message,
            status: status || 'active'
        });

        logger.info(`Alert created: ${alert.id} for location ${location_id}`);

        return res.status(201).json({
            message: 'Alert created successfully',
            data: alert
        });
    } catch (error) {
        logger.error('Error creating alert:', error);
        return res.status(500).json({
            error: 'Failed to create alert'
        });
    }
};

const bulkCreateAlerts = async (req, res) => {
    try {
        const { alerts } = req.body;

        if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
            return res.status(400).json({
                error: 'alerts array is required'
            });
        }

        const createdAlerts = await Alert.bulkCreate(alerts);

        logger.info(`Bulk created ${createdAlerts.length} alerts`);

        return res.status(201).json({
            message: 'Alerts created successfully',
            count: createdAlerts.length,
            data: createdAlerts
        });
    } catch (error) {
        logger.error('Error bulk creating alerts:', error);
        return res.status(500).json({
            error: 'Failed to create alerts'
        });
    }
};

const updateAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'status is required'
            });
        }

        const validStatuses = ['active', 'sent', 'failed', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: active, sent, failed, resolved'
            });
        }

        const alert = await Alert.updateStatus(id, status);

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        logger.info(`Alert ${id} status updated to: ${status}`);

        return res.status(200).json({
            message: 'Alert status updated successfully',
            data: alert
        });
    } catch (error) {
        logger.error('Error updating alert status:', error);
        return res.status(500).json({
            error: 'Failed to update alert status'
        });
    }
};

const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Alert.delete(id);

        if (!deleted) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        logger.info(`Alert deleted: ${id}`);

        return res.status(200).json({
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting alert:', error);
        return res.status(500).json({
            error: 'Failed to delete alert'
        });
    }
};

const getAlertStats = async (req, res) => {
    try {
        const stats = await Alert.countByStatus();

        return res.status(200).json({
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching alert stats:', error);
        return res.status(500).json({
            error: 'Failed to fetch alert statistics'
        });
    }
};

module.exports = {
    getAllAlerts,
    getActiveAlerts,
    getAlertById,
    getAlertsByLocation,
    getAlertsByRiskLevel,
    getRecentAlerts,
    createAlert,
    bulkCreateAlerts,
    updateAlertStatus,
    deleteAlert,
    getAlertStats
};