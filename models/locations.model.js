const db = require('../db/db');

class Location {
    // Get all locations with latest risk assessment
    static async findAllWithRisk() {
        const result = await db.query(
            `SELECT
                l.*,
                r.risk_level,
                r.risk_score,
                r.risk_color,
                r.timestamp as risk_timestamp
            FROM locations l
            LEFT JOIN LATERAL (
                SELECT risk_level, risk_score,
                    (factors::json->0->>'color') as risk_color,
                    timestamp
                FROM risk_assessments
                WHERE location_id = l.id
                ORDER BY timestamp DESC
                LIMIT 1
            ) r ON true
            ORDER BY l.district, l.name`
        );
        return result.rows;
    }

    // Get location by ID
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM locations WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get current weather for location
    static async getCurrentWeather(locationId) {
        const result = await db.query(
            `SELECT * FROM weather_data
             WHERE location_id = $1
             ORDER BY timestamp DESC
             LIMIT 1`,
            [locationId]
        );
        return result.rows[0];
    }

    // Get current risk assessment for location
    static async getCurrentRisk(locationId) {
        const result = await db.query(
            `SELECT * FROM risk_assessments
             WHERE location_id = $1
             ORDER BY timestamp DESC
             LIMIT 1`,
            [locationId]
        );
        return result.rows[0];
    }

    // Get location details with weather and risk
    static async findByIdWithDetails(id) {
        const [location, weather, risk] = await Promise.all([
            this.findById(id),
            this.getCurrentWeather(id),
            this.getCurrentRisk(id)
        ]);

        return {
            location,
            currentWeather: weather || null,
            currentRisk: risk || null
        };
    }

    // Get locations by district
    static async findByDistrict(district) {
        const result = await db.query(
            'SELECT * FROM locations WHERE district = $1 ORDER BY name',
            [district]
        );
        return result.rows;
    }

    // Get locations by risk level
    static async findByRiskLevel(riskLevel) {
        const result = await db.query(
            `SELECT l.*, ra.risk_level, ra.risk_score, ra.timestamp as risk_timestamp
             FROM locations l
             INNER JOIN (
                 SELECT DISTINCT ON (location_id)
                     location_id, risk_level, risk_score, timestamp
                 FROM risk_assessments
                 ORDER BY location_id, timestamp DESC
             ) ra ON l.id = ra.location_id
             WHERE ra.risk_level = $1
             ORDER BY ra.risk_score DESC`,
            [riskLevel]
        );
        return result.rows;
    }

    // Create new location
    static async create(locationData) {
        const { name, district, latitude, longitude, description } = locationData;
        
        const result = await db.query(
            `INSERT INTO locations (name, district, latitude, longitude, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, district, latitude, longitude, description]
        );
        return result.rows[0];
    }

    // Update location
    static async update(id, updates) {
        const { name, district, latitude, longitude, description } = updates;
        let query = 'UPDATE locations SET';
        const values = [];
        let paramCount = 1;
        const fields = [];

        if (name !== undefined) {
            fields.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }
        if (district !== undefined) {
            fields.push(`district = $${paramCount}`);
            values.push(district);
            paramCount++;
        }
        if (latitude !== undefined) {
            fields.push(`latitude = $${paramCount}`);
            values.push(latitude);
            paramCount++;
        }
        if (longitude !== undefined) {
            fields.push(`longitude = $${paramCount}`);
            values.push(longitude);
            paramCount++;
        }
        if (description !== undefined) {
            fields.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        query += ' ' + fields.join(', ');
        query += ` WHERE id = $${paramCount} RETURNING *`;
        values.push(id);

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Delete location
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM locations WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get weather history for location
    static async getWeatherHistory(locationId, limit = 24) {
        const result = await db.query(
            `SELECT * FROM weather_data
             WHERE location_id = $1
             ORDER BY timestamp DESC
             LIMIT $2`,
            [locationId, limit]
        );
        return result.rows;
    }

    // Get risk history for location
    static async getRiskHistory(locationId, limit = 10) {
        const result = await db.query(
            `SELECT * FROM risk_assessments
             WHERE location_id = $1
             ORDER BY timestamp DESC
             LIMIT $2`,
            [locationId, limit]
        );
        return result.rows;
    }

    // Count locations
    static async count() {
        const result = await db.query('SELECT COUNT(*) as total FROM locations');
        return parseInt(result.rows[0].total);
    }

    // Get all districts
    static async getDistricts() {
        const result = await db.query(
            'SELECT DISTINCT district FROM locations ORDER BY district'
        );
        return result.rows.map(row => row.district);
    }
}

module.exports = Location;