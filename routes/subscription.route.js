const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');



// GET /api/subscriptions - Get all subscriptions
router.get('/', subscriptionController.getAllSubscriptions);

// GET /api/subscriptions/active - Get active subscriptions
router.get('/active', subscriptionController.getActiveSubscriptions);

// GET /api/subscriptions/:id - Get subscription by ID
router.get('/:id', subscriptionController.getSubscriptionById);

// GET /api/subscriptions/location/:locationId - Get subscriptions by location
router.get('/location/:locationId', subscriptionController.getSubscriptionsByLocation);

// POST /api/subscriptions - Create subscription
router.post('/', subscriptionController.createSubscription);

// PUT /api/subscriptions/:id - Update subscription
router.put('/:id', subscriptionController.updateSubscription);

// PATCH /api/subscriptions/:id/toggle - Toggle active status
router.patch('/:id/toggle', subscriptionController.toggleSubscription);

// DELETE /api/subscriptions/:id - Delete subscription
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;