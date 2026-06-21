const path = require('path');

// Mock Logger
const mockLogger = {
    info: () => {},
    error: () => {}
};

// Mock Alert Model
const mockAlertModel = {
    create: async () => ({ id: 1 }),
    findById: async () => ({
        id: 1,
        location_name: 'Test Location',
        risk_level: 'HIGH',
        rainfall_24h: 50
    }),
    updateStatus: async () => ({ id: 1, status: 'sent' })
};

// Mock Alert Service
let emailTriggered = false;
let emailData = null;
const mockAlertService = {
    triggerEmailAlert: async (email, data) => {
        emailTriggered = true;
        emailData = { email, data };
        console.log('Mock Email Sent:', { email, data });
    }
};

// Inject mocks into require cache
require.cache[require.resolve('../models/alert.model')] = { exports: mockAlertModel };
require.cache[require.resolve('../utils/logger.util')] = { exports: mockLogger };
require.cache[require.resolve('../services/alert.service')] = { exports: mockAlertService };

// Now require the controller
const controller = require('../controllers/alert.controller');

// Request/Response Mocks
const mockRequest = (body) => ({ body });
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function runTest() {
    console.log('Running Alert Email Test (Mocked)...');

    try {
        const req = mockRequest({
            location_id: 1,
            risk_assessment_id: 1,
            alert_type: 'EMAIL',
            recipient: 'test@example.com',
            message: 'Test alert',
            status: 'active'
        });
        const res = mockResponse();

        await controller.createAlert(req, res);

        if (res.statusCode === 201 && emailTriggered) {
            console.log('✅ Test Passed: Alert created and email triggered.');
            console.log('Email Data:', emailData);
        } else {
            console.error('❌ Test Failed:');
            if (res.statusCode !== 201) console.error(`Expected status 201, got ${res.statusCode}`);
            if (!emailTriggered) console.error('Email verify not triggered');
        }

    } catch (error) {
        console.error('❌ Test Error:', error);
    }
}

runTest();
