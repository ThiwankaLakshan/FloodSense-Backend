const db = require('../db/db');

class Subscription {
    // Get all subscriptions
    static async findAll() {
        const result = await db.query(
            `SELECT 
                s.*,
                l.name as location_name,
                l.district
            FROM alert_subscriptions s
            LEFT JOIN locations l ON s.location_id = l.id
            ORDER BY s.created_at DESC`
        );
        return result.rows;
    }

    // Get subscription by ID
    static async findById(id) {
        const result = await db.query(
            `SELECT 
                s.*,
                l.name as location_name,
                l.district
            FROM alert_subscriptions s
            LEFT JOIN locations l ON s.location_id = l.id
            WHERE s.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Get subscriptions by location
    static async findByLocation(locationId) {
        const result = await db.query(
            `SELECT * FROM alert_subscriptions
             WHERE location_id = $1
             AND is_active = true
             ORDER BY created_at DESC`,
            [locationId]
        );
        return result.rows;
    }

    // Get active subscriptions for a location with minimum risk level
    static async findActiveByLocationAndRisk(locationId, riskLevel) {
        // Risk level hierarchy: LOW < MODERATE < HIGH < CRITICAL
        const riskHierarchy = {
            'LOW': ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
            'MODERATE': ['MODERATE', 'HIGH', 'CRITICAL'],
            'HIGH': ['HIGH', 'CRITICAL'],
            'CRITICAL': ['CRITICAL']
        };

        const allowedLevels = riskHierarchy[riskLevel] || [];

        const result = await db.query(
            `SELECT * FROM alert_subscriptions
             WHERE location_id = $1
             AND is_active = true
             AND min_risk_level = ANY($2)`,
            [locationId, allowedLevels]
        );
        return result.rows;
    }

    // Create subscription
    static async create(subscriptionData) {
        const {
            location_id,
            phone_number,
            email,
            min_risk_level = 'MODERATE',
            is_active = true
        } = subscriptionData;

        const result = await db.query(
            `INSERT INTO alert_subscriptions
             (location_id, phone_number, email, min_risk_level, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [location_id, phone_number, email, min_risk_level, is_active]
        );
        return result.rows[0];
    }

    // Update subscription
    static async update(id, updates) {
        const {
            location_id,
            phone_number,
            email,
            min_risk_level,
            is_active
        } = updates;

        let query = 'UPDATE alert_subscriptions SET updated_at = CURRENT_TIMESTAMP';
        const values = [];
        let paramCount = 1;

        if (location_id !== undefined) {
            query += `, location_id = $${paramCount}`;
            values.push(location_id);
            paramCount++;
        }
        if (phone_number !== undefined) {
            query += `, phone_number = $${paramCount}`;
            values.push(phone_number);
            paramCount++;
        }
        if (email !== undefined) {
            query += `, email = $${paramCount}`;
            values.push(email);
            paramCount++;
        }
        if (min_risk_level !== undefined) {
            query += `, min_risk_level = $${paramCount}`;
            values.push(min_risk_level);
            paramCount++;
        }
        if (is_active !== undefined) {
            query += `, is_active = $${paramCount}`;
            values.push(is_active);
            paramCount++;
        }

        query += ` WHERE id = $${paramCount} RETURNING *`;
        values.push(id);

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Toggle active status
    static async toggleActive(id, isActive) {
        const result = await db.query(
            `UPDATE alert_subscriptions
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [isActive, id]
        );
        return result.rows[0];
    }

    // Delete subscription
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM alert_subscriptions WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get subscription count by location
    static async countByLocation(locationId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM alert_subscriptions WHERE location_id = $1',
            [locationId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get all active subscriptions
    static async findAllActive() {
        const result = await db.query(
            `SELECT 
                s.*,
                l.name as location_name,
                l.district
            FROM alert_subscriptions s
            LEFT JOIN locations l ON s.location_id = l.id
            WHERE s.is_active = true
            ORDER BY s.created_at DESC`
        );
        return result.rows;
    }
}

module.exports = Subscription;