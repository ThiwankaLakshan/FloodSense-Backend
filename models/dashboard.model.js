const db = require('../db/db');

class Dashboard {
    // Get total locations count
    static async getTotalLocations() {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM locations'
        );
        return parseInt(result.rows[0].count);
    }

    // Get risk distribution
    static async getRiskDistribution() {
        const result = await db.query(
            `SELECT
                risk_level,
                COUNT(*) as count
            FROM (
                SELECT DISTINCT ON (location_id)
                    location_id, risk_level
                FROM risk_assessments
                ORDER BY location_id, timestamp DESC
            ) latest_risks
            GROUP BY risk_level`
        );

        const distribution = {
            CRITICAL: 0,
            HIGH: 0,
            MODERATE: 0,
            LOW: 0
        };

        result.rows.forEach(row => {
            distribution[row.risk_level] = parseInt(row.count);
        });

        return distribution;
    }

    // Get last weather update timestamp
    static async getLastWeatherUpdate() {
        const result = await db.query(
            'SELECT MAX(timestamp) as last_update FROM weather_data'
        );
        return result.rows[0].last_update;
    }

    // Get active alerts count
    static async getActiveAlertsCount() {
        const result = await db.query(
            `SELECT COUNT(*) as count 
             FROM alerts 
             WHERE status = 'active'`
        );
        return parseInt(result.rows[0].count);
    }

    // Get recent alerts
    static async getRecentAlerts(limit = 10) {
        const result = await db.query(
            `SELECT * FROM alerts 
             ORDER BY created_at DESC 
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    // Get locations by risk level
    static async getLocationsByRiskLevel(riskLevel) {
        const result = await db.query(
            `SELECT l.*, ra.risk_level, ra.timestamp
             FROM locations l
             INNER JOIN (
                 SELECT DISTINCT ON (location_id)
                     location_id, risk_level, timestamp
                 FROM risk_assessments
                 ORDER BY location_id, timestamp DESC
             ) ra ON l.id = ra.location_id
             WHERE ra.risk_level = $1`,
            [riskLevel]
        );
        return result.rows;
    }

    // Get weather trends for a location
    static async getWeatherTrends(locationId, hours = 24) {
        const result = await db.query(
            `SELECT * FROM weather_data
             WHERE location_id = $1
             AND timestamp >= NOW() - INTERVAL '${hours} hours'
             ORDER BY timestamp DESC`,
            [locationId]
        );
        return result.rows;
    }

    // Get summary stats
    static async getSummary() {
        const [totalLocations, riskDistribution, lastUpdate] = await Promise.all([
            this.getTotalLocations(),
            this.getRiskDistribution(),
            this.getLastWeatherUpdate()
        ]);

        return {
            totalLocations,
            riskDistribution,
            lastUpdate
        };
    }
}

module.exports = Dashboard;