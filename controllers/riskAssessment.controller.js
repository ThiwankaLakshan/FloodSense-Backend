const RiskAssessment = require('../models/riskAssessment.model');

const getRiskHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '7d' } = req.query;

        const validPeriods = ['24h', '7d', '30d', '90d'];
        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                error: 'Invalid period. Use: 24h, 7d, 30d, or 90d'
            });
        }

        const history = await RiskAssessment.getHistory(id, period);

        return res.status(200).json({
            period,
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

const getLatestRisk = async (req, res) => {
    try {
        const { id } = req.params;

        const latest = await RiskAssessment.getLatest(id);

        if (!latest) {
            return res.status(404).json({
                error: 'No risk assessment found for this location'
            });
        }

        return res.status(200).json({
            data: latest
        });
    } catch (error) {
        console.error('Error fetching latest risk:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk assessment'
        });
    }
};

const getRiskTrend = async (req, res) => {
    try {
        const { id } = req.params;
        const { hours = 24 } = req.query;

        const trend = await RiskAssessment.getTrend(id, parseInt(hours));

        return res.status(200).json({
            data: trend
        });
    } catch (error) {
        console.error('Error fetching risk trend:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk trend'
        });
    }
};

const getRiskStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '30d' } = req.query;

        const stats = await RiskAssessment.getStats(id, period);

        return res.status(200).json({
            period,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching risk stats:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk statistics'
        });
    }
};

const getByRiskLevel = async (req, res) => {
    try {
        const { riskLevel } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        if (!['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].includes(riskLevel)) {
            return res.status(400).json({
                error: 'Invalid risk level'
            });
        }

        const assessments = await RiskAssessment.getByRiskLevel(riskLevel, limit);

        return res.status(200).json({
            count: assessments.length,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching risk assessments:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk assessments'
        });
    }
};

const createRiskAssessment = async (req, res) => {
    try {
        const {
            location_id,
            risk_level,
            risk_score,
            factors,
            rainfall_24h,
            rainfall_72h
        } = req.body;

        if (!location_id || !risk_level || risk_score === undefined) {
            return res.status(400).json({
                error: 'location_id, risk_level, and risk_score are required'
            });
        }

        const assessment = await RiskAssessment.create({
            location_id,
            risk_level,
            risk_score,
            factors,
            rainfall_24h,
            rainfall_72h
        });

        return res.status(201).json({
            message: 'Risk assessment created successfully',
            data: assessment
        });
    } catch (error) {
        console.error('Error creating risk assessment:', error);
        return res.status(500).json({
            error: 'Failed to create risk assessment'
        });
    }
};

const getAllRiskAssessments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const assessments = await RiskAssessment.findAll(page, limit);

        return res.status(200).json({
            page,
            limit,
            count: assessments.length,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching risk assessments:', error);
        return res.status(500).json({
            error: 'Failed to fetch risk assessments'
        });
    }
};

module.exports = {
    getRiskHistory,
    getLatestRisk,
    getRiskTrend,
    getRiskStats,
    getByRiskLevel,
    createRiskAssessment,
    getAllRiskAssessments
};