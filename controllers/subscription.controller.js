const Subscription = require('../models/subscription.model');
const logger = require('../utils/logger.util');

const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll();

        return res.status(200).json({
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        logger.error('Error fetching subscriptions:', error);
        return res.status(500).json({
            error: 'Failed to fetch subscriptions'
        });
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({
                error: 'Subscription not found'
            });
        }

        return res.status(200).json({
            data: subscription
        });
    } catch (error) {
        logger.error('Error fetching subscription:', error);
        return res.status(500).json({
            error: 'Failed to fetch subscription'
        });
    }
};

const getSubscriptionsByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const subscriptions = await Subscription.findByLocation(locationId);

        return res.status(200).json({
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        logger.error('Error fetching subscriptions by location:', error);
        return res.status(500).json({
            error: 'Failed to fetch subscriptions'
        });
    }
};

const getActiveSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.findAllActive();

        return res.status(200).json({
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        logger.error('Error fetching active subscriptions:', error);
        return res.status(500).json({
            error: 'Failed to fetch active subscriptions'
        });
    }
};

const createSubscription = async (req, res) => {
    try {
        const { location_id, phone_number, email, min_risk_level, is_active } = req.body;

        // Validation
        if (!location_id) {
            return res.status(400).json({
                error: 'location_id is required'
            });
        }

        if (!phone_number && !email) {
            return res.status(400).json({
                error: 'At least one contact method (phone_number or email) is required'
            });
        }

        // Validate risk level
        const validRiskLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
        if (min_risk_level && !validRiskLevels.includes(min_risk_level)) {
            return res.status(400).json({
                error: 'Invalid risk level'
            });
        }

        const subscription = await Subscription.create({
            location_id,
            phone_number,
            email,
            min_risk_level: min_risk_level || 'MODERATE',
            is_active: is_active !== undefined ? is_active : true
        });

        logger.info(`Subscription created: ${subscription.id}`);

        return res.status(201).json({
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Error creating subscription:', error);
        return res.status(500).json({
            error: 'Failed to create subscription'
        });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate risk level if provided
        if (updates.min_risk_level) {
            const validRiskLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
            if (!validRiskLevels.includes(updates.min_risk_level)) {
                return res.status(400).json({
                    error: 'Invalid risk level'
                });
            }
        }

        const subscription = await Subscription.update(id, updates);

        if (!subscription) {
            return res.status(404).json({
                error: 'Subscription not found'
            });
        }

        logger.info(`Subscription updated: ${id}`);

        return res.status(200).json({
            message: 'Subscription updated successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Error updating subscription:', error);
        return res.status(500).json({
            error: 'Failed to update subscription'
        });
    }
};

const toggleSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({
                error: 'is_active is required'
            });
        }

        const subscription = await Subscription.toggleActive(id, is_active);

        if (!subscription) {
            return res.status(404).json({
                error: 'Subscription not found'
            });
        }

        logger.info(`Subscription toggled: ${id} - ${is_active ? 'active' : 'inactive'}`);

        return res.status(200).json({
            message: `Subscription ${is_active ? 'activated' : 'deactivated'}`,
            data: subscription
        });
    } catch (error) {
        logger.error('Error toggling subscription:', error);
        return res.status(500).json({
            error: 'Failed to toggle subscription'
        });
    }
};

const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Subscription.delete(id);

        if (!deleted) {
            return res.status(404).json({
                error: 'Subscription not found'
            });
        }

        logger.info(`Subscription deleted: ${id}`);

        return res.status(200).json({
            message: 'Subscription deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting subscription:', error);
        return res.status(500).json({
            error: 'Failed to delete subscription'
        });
    }
};

module.exports = {
    getAllSubscriptions,
    getSubscriptionById,
    getSubscriptionsByLocation,
    getActiveSubscriptions,
    createSubscription,
    updateSubscription,
    toggleSubscription,
    deleteSubscription
};