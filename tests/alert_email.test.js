const { createAlert } = require('./controllers/alert.controller');
const Alert = require('./models/alert.model');
const { triggerEmailAlert } = require('./services/alert.service');

// Mock dependencies
jest.mock('./models/alert.model');
jest.mock('./services/alert.service');
jest.mock('./utils/logger.util', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Alert Controller - createAlert', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should trigger email alert when alert_type is EMAIL', async () => {
        const req = {
            body: {
                location_id: 1,
                risk_assessment_id: 1,
                alert_type: 'EMAIL',
                recipient: 'test@example.com',
                message: 'Test alert',
                status: 'active'
            }
        };
        const res = mockResponse();

        const mockAlert = { id: 1, ...req.body };
        const mockFullAlert = { 
            ...mockAlert, 
            location_name: 'Test Location', 
            risk_level: 'HIGH', 
            rainfall_24h: 50 
        };

        Alert.create.mockResolvedValue(mockAlert);
        Alert.findById.mockResolvedValue(mockFullAlert);
        Alert.updateStatus.mockResolvedValue({ ...mockAlert, status: 'sent' });

        await createAlert(req, res);

        expect(Alert.create).toHaveBeenCalled();
        expect(Alert.findById).toHaveBeenCalledWith(1);
        expect(triggerEmailAlert).toHaveBeenCalledWith('test@example.com', {
            location: 'Test Location',
            riskLevel: 'HIGH',
            rainfall24h: 50
        });
        expect(Alert.updateStatus).toHaveBeenCalledWith(1, 'sent');
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle email sending failure', async () => {
        const req = {
            body: {
                location_id: 1,
                risk_assessment_id: 1,
                alert_type: 'EMAIL',
                recipient: 'test@example.com',
                message: 'Test alert'
            }
        };
        const res = mockResponse();

        const mockAlert = { id: 1, ...req.body };
        const mockFullAlert = { ...mockAlert, location_name: 'Test Location', risk_level: 'HIGH' };

        Alert.create.mockResolvedValue(mockAlert);
        Alert.findById.mockResolvedValue(mockFullAlert);
        triggerEmailAlert.mockRejectedValue(new Error('Email failed'));

        await createAlert(req, res);

        expect(triggerEmailAlert).toHaveBeenCalled();
        expect(Alert.updateStatus).toHaveBeenCalledWith(1, 'failed');
        // Even if email fails, alert creation should be successful (but marked as failed status)
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
