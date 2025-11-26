const db = require('../db/db');

class RiskAssessment {
    // Get risk history for a location
    static async getHistory(locationId, period = '7d') {
        const intervalMap = {
            '24h': '24 hours',
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days'
        };

        const interval = intervalMap[period] || '7 days';

        const result = await db.query(
            `SELECT 
                timestamp,
                risk_level,
                risk_score,
                factors,
                rainfall_24h,
                rainfall_72h
            FROM risk_assessments
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${interval}'
            ORDER BY timestamp DESC`,
            [locationId]
        );

        return result.rows;
    }

    // Get latest risk assessment for location
    static async getLatest(locationId) {
        const result = await db.query(
            `SELECT * FROM risk_assessments
             WHERE location_id = $1
             ORDER BY timestamp DESC
             LIMIT 1`,
            [locationId]
        );
        return result.rows[0];
    }

    // Get risk assessments by level
    static async getByRiskLevel(riskLevel, limit = 50) {
        const result = await db.query(
            `SELECT ra.*, l.name as location_name, l.district
             FROM risk_assessments ra
             INNER JOIN locations l ON ra.location_id = l.id
             WHERE ra.risk_level = $1
             ORDER BY ra.timestamp DESC
             LIMIT $2`,
            [riskLevel, limit]
        );
        return result.rows;
    }

    // Create new risk assessment
    static async create(assessmentData) {
        const {
            location_id,
            risk_level,
            risk_score,
            factors,
            rainfall_24h,
            rainfall_72h
        } = assessmentData;

        const result = await db.query(
            `INSERT INTO risk_assessments 
             (location_id, risk_level, risk_score, factors, rainfall_24h, rainfall_72h)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [location_id, risk_level, risk_score, JSON.stringify(factors), rainfall_24h, rainfall_72h]
        );

        return result.rows[0];
    }

    // Get risk trend (increasing/decreasing)
    static async getTrend(locationId, hours = 24) {
        const result = await db.query(
            `SELECT 
                risk_score,
                timestamp
            FROM risk_assessments
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${hours} hours'
            ORDER BY timestamp ASC`,
            [locationId]
        );

        if (result.rows.length < 2) {
            return { trend: 'stable', change: 0 };
        }

        const first = result.rows[0].risk_score;
        const last = result.rows[result.rows.length - 1].risk_score;
        const change = last - first;

        let trend = 'stable';
        if (change > 5) trend = 'increasing';
        else if (change < -5) trend = 'decreasing';

        return { trend, change, data: result.rows };
    }

    // Get risk statistics for a location
    static async getStats(locationId, period = '30d') {
        const intervalMap = {
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days'
        };

        const interval = intervalMap[period] || '30 days';

        const result = await db.query(
            `SELECT 
                AVG(risk_score) as avg_score,
                MAX(risk_score) as max_score,
                MIN(risk_score) as min_score,
                COUNT(*) as total_assessments,
                COUNT(CASE WHEN risk_level = 'CRITICAL' THEN 1 END) as critical_count,
                COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_count,
                COUNT(CASE WHEN risk_level = 'MODERATE' THEN 1 END) as moderate_count,
                COUNT(CASE WHEN risk_level = 'LOW' THEN 1 END) as low_count
            FROM risk_assessments
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${interval}'`,
            [locationId]
        );

        const stats = result.rows[0];
        
        return {
            avgScore: parseFloat(stats.avg_score) || 0,
            maxScore: parseInt(stats.max_score) || 0,
            minScore: parseInt(stats.min_score) || 0,
            totalAssessments: parseInt(stats.total_assessments) || 0,
            distribution: {
                critical: parseInt(stats.critical_count) || 0,
                high: parseInt(stats.high_count) || 0,
                moderate: parseInt(stats.moderate_count) || 0,
                low: parseInt(stats.low_count) || 0
            }
        };
    }

    // Get all risk assessments (with pagination)
    static async findAll(page = 1, limit = 50) {
        const offset = (page - 1) * limit;

        const result = await db.query(
            `SELECT ra.*, l.name as location_name, l.district
             FROM risk_assessments ra
             INNER JOIN locations l ON ra.location_id = l.id
             ORDER BY ra.timestamp DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return result.rows;
    }

    // Delete old assessments (cleanup)
    static async deleteOld(days = 90) {
        const result = await db.query(
            `DELETE FROM risk_assessments
             WHERE timestamp < NOW() - INTERVAL '${days} days'
             RETURNING id`
        );

        return result.rows.length;
    }
}

module.exports = RiskAssessment;