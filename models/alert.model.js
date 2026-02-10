const db = require('../db/db');

class Alert {
    // Get all alerts
    static async findAll(params = {}) {
        const { status, limit = 100, offset = 0 } = params;
        
        let query = `
            SELECT 
                a.*,
                l.name as location_name,
                l.district,
                ra.risk_level
            FROM alerts a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN risk_assessments ra ON a.risk_assessment_id = ra.id
        `;

        const values = [];
        let paramCount = 1;

        if (status) {
            query += ` WHERE a.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);
        return result.rows;
    }

    // Get active alerts
    static async findActive(limit = 50) {
        const result = await db.query(
            `SELECT 
                a.*,
                l.name as location_name,
                l.district,
                ra.risk_level
            FROM alerts a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN risk_assessments ra ON a.risk_assessment_id = ra.id
            WHERE a.status = 'active'
            ORDER BY a.created_at DESC
            LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    // Get alert by ID
    static async findById(id) {
        const result = await db.query(
            `SELECT 
                a.*,
                l.name as location_name,
                l.district,
                ra.risk_level,
                ra.risk_score
            FROM alerts a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN risk_assessments ra ON a.risk_assessment_id = ra.id
            WHERE a.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Get alerts by location
    static async findByLocation(locationId, limit = 50) {
        const result = await db.query(
            `SELECT 
                a.*,
                l.name as location_name,
                l.district,
                ra.risk_level
            FROM alerts a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN risk_assessments ra ON a.risk_assessment_id = ra.id
            WHERE a.location_id = $1
            ORDER BY a.created_at DESC
            LIMIT $2`,
            [locationId, limit]
        );
        return result.rows;
    }

    // Get alerts by risk level
    static async findByRiskLevel(riskLevel, limit = 50) {
        const result = await db.query(
            `SELECT 
                a.*,
                l.name as location_name,
                l.district,
                ra.risk_level
            FROM alerts a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN risk_assessments ra ON a.risk_assessment_id = ra.id
            WHERE ra.risk_level = $1
            ORDER BY a.created_at DESC
            LIMIT $2`,
            [riskLevel, limit]
        );
        return result.rows;
    }

    // Create alert
    static async create(alertData) {
        const {
            location_id,
            risk_assessment_id,
            alert_type = 'SMS',
            recipient,
            message,
            status = 'active'
        } = alertData;

        const result = await db.query(
            `INSERT INTO alerts
             (location_id, risk_assessment_id, alert_type, recipient, message, status, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING *`,
            [location_id, risk_assessment_id, alert_type, recipient, message, status]
        );

        return result.rows[0];
    }

    // Bulk create alerts
    static async bulkCreate(alertsArray) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            const createdAlerts = [];
            
            for (const alertData of alertsArray) {
                const result = await client.query(
                    `INSERT INTO alerts
                     (location_id, risk_assessment_id, alert_type, recipient, message, status, sent_at)
                     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                     RETURNING *`,
                    [
                        alertData.location_id,
                        alertData.risk_assessment_id,
                        alertData.alert_type || 'SMS',
                        alertData.recipient,
                        alertData.message,
                        alertData.status || 'active'
                    ]
                );
                createdAlerts.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            return createdAlerts;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Update alert status
    static async updateStatus(id, status) {
        const validStatuses = ['active', 'sent', 'failed', 'resolved'];
        
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const result = await db.query(
            `UPDATE alerts
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        return result.rows[0];
    }

    // Delete alert
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM alerts WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get alert count by status
    static async countByStatus() {
        const result = await db.query(
            `SELECT 
                status,
                COUNT(*) as count
             FROM alerts
             GROUP BY status`
        );
        
        const counts = {
            active: 0,
            sent: 0,
            failed: 0,
            resolved: 0
        };

        result.rows.forEach(row => {
            counts[row.status] = parseInt(row.count);
        });

        return counts;
    }

    // Get recent alerts (last 24 hours)
    static async findRecent(hours = 24, limit = 100) {
        const result = await db.query(
            `SELECT 
                a.*,
                l.name as location_name,
                l.district,
                ra.risk_level
            FROM alerts a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN risk_assessments ra ON a.risk_assessment_id = ra.id
            WHERE a.created_at >= NOW() - INTERVAL '${hours} hours'
            ORDER BY a.created_at DESC
            LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    // Mark old alerts as resolved
    static async resolveOldAlerts(days = 7) {
        const result = await db.query(
            `UPDATE alerts
             SET status = 'resolved'
             WHERE status = 'active'
             AND created_at < NOW() - INTERVAL '${days} days'
             RETURNING id`
        );
        
        return result.rows.length;
    }
}

module.exports = Alert;