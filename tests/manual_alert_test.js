const { createAlert } = require('../controllers/alert.controller');
const Alert = require('../models/alert.model');
const alertService = require('../services/alert.service');

// Simple mocking utility
const mock = (obj, prop, implementation) => {
    const original = obj[prop];
    obj[prop] = implementation;
    return () => { obj[prop] = original; };
};

// Mock Express request and response
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
    console.log('Running Alert Email Test...');

    // Mock Alert.create
    const restoreCreate = mock(Alert, 'create', async (data) => ({ id: 1, ...data }));

    // Mock Alert.findById
    const restoreFindById = mock(Alert, 'findById', async (id) => ({
        id,
        location_name: 'Test Location',
        risk_level: 'HIGH',
        rainfall_24h: 50
    }));

    // Mock Alert.updateStatus
    const restoreUpdateStatus = mock(Alert, 'updateStatus', async (id, status) => ({ id, status }));

    // Mock triggerEmailAlert
    let emailTriggered = false;
    let emailData = null;
    const restoreTriggerEmail = mock(alertService, 'triggerEmailAlert', async (email, data) => {
        emailTriggered = true;
        emailData = { email, data };
    });

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

        await createAlert(req, res);

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
    } finally {
        // Restore mocks
        restoreCreate();
        restoreFindById();
        restoreUpdateStatus();
        restoreTriggerEmail();
    }
}

runTest();
