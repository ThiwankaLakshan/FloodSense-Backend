const db = require('../db/db');

class Weather {
    // Get weather history for a location
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
                temperature,
                humidity,
                rainfall_1h,
                rainfall_24h,
                wind_speed,
                weather_condition
            FROM weather_data
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${interval}'
            ORDER BY timestamp ASC`,
            [locationId]
        );

        return result.rows;
    }

    // Get current weather for location
    static async getCurrent(locationId) {
        const result = await db.query(
            `SELECT * FROM weather_data
             WHERE location_id = $1
             ORDER BY timestamp DESC
             LIMIT 1`,
            [locationId]
        );
        return result.rows[0];
    }

    // Get latest weather for all locations
    static async getLatestForAll() {
        const result = await db.query(
            `SELECT DISTINCT ON (wd.location_id)
                wd.*,
                l.name as location_name,
                l.district
            FROM weather_data wd
            INNER JOIN locations l ON wd.location_id = l.id
            ORDER BY wd.location_id, wd.timestamp DESC`
        );
        return result.rows;
    }

    // Create new weather data entry
    static async create(weatherData) {
        const {
            location_id,
            temperature,
            humidity,
            rainfall_1h,
            rainfall_24h,
            wind_speed,
            weather_condition,
            pressure,
            cloud_cover
        } = weatherData;

        const result = await db.query(
            `INSERT INTO weather_data 
             (location_id, temperature, humidity, rainfall_1h, rainfall_24h, 
              wind_speed, weather_condition, pressure, cloud_cover)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [location_id, temperature, humidity, rainfall_1h, rainfall_24h, 
             wind_speed, weather_condition, pressure, cloud_cover]
        );

        return result.rows[0];
    }

    // Get weather statistics for a location
    static async getStats(locationId, period = '7d') {
        const intervalMap = {
            '24h': '24 hours',
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days'
        };

        const interval = intervalMap[period] || '7 days';

        const result = await db.query(
            `SELECT 
                AVG(temperature) as avg_temp,
                MAX(temperature) as max_temp,
                MIN(temperature) as min_temp,
                AVG(humidity) as avg_humidity,
                MAX(humidity) as max_humidity,
                MIN(humidity) as min_humidity,
                SUM(rainfall_1h) as total_rainfall,
                MAX(rainfall_1h) as max_rainfall_1h,
                MAX(rainfall_24h) as max_rainfall_24h,
                AVG(wind_speed) as avg_wind_speed,
                MAX(wind_speed) as max_wind_speed,
                COUNT(*) as data_points
            FROM weather_data
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${interval}'`,
            [locationId]
        );

        const stats = result.rows[0];

        return {
            temperature: {
                avg: parseFloat(stats.avg_temp) || 0,
                max: parseFloat(stats.max_temp) || 0,
                min: parseFloat(stats.min_temp) || 0
            },
            humidity: {
                avg: parseFloat(stats.avg_humidity) || 0,
                max: parseFloat(stats.max_humidity) || 0,
                min: parseFloat(stats.min_humidity) || 0
            },
            rainfall: {
                total: parseFloat(stats.total_rainfall) || 0,
                maxHourly: parseFloat(stats.max_rainfall_1h) || 0,
                maxDaily: parseFloat(stats.max_rainfall_24h) || 0
            },
            wind: {
                avg: parseFloat(stats.avg_wind_speed) || 0,
                max: parseFloat(stats.max_wind_speed) || 0
            },
            dataPoints: parseInt(stats.data_points) || 0
        };
    }

    // Get rainfall trends
    static async getRainfallTrend(locationId, hours = 24) {
        const result = await db.query(
            `SELECT 
                timestamp,
                rainfall_1h,
                rainfall_24h
            FROM weather_data
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${hours} hours'
            ORDER BY timestamp ASC`,
            [locationId]
        );

        return result.rows;
    }

    // Get weather alerts (high rainfall, extreme temp, etc.)
    static async getAlertConditions() {
        const result = await db.query(
            `SELECT DISTINCT ON (wd.location_id)
                wd.*,
                l.name as location_name,
                l.district,
                CASE
                    WHEN wd.rainfall_1h > 50 THEN 'Heavy Rainfall'
                    WHEN wd.rainfall_24h > 150 THEN 'Extreme Rainfall'
                    WHEN wd.wind_speed > 60 THEN 'High Wind'
                    WHEN wd.temperature > 35 THEN 'Extreme Heat'
                END as alert_type
            FROM weather_data wd
            INNER JOIN locations l ON wd.location_id = l.id
            WHERE wd.rainfall_1h > 50 
               OR wd.rainfall_24h > 150 
               OR wd.wind_speed > 60
               OR wd.temperature > 35
            ORDER BY wd.location_id, wd.timestamp DESC`
        );

        return result.rows;
    }

    // Get hourly rainfall data
    static async getHourlyRainfall(locationId, hours = 24) {
        const result = await db.query(
            `SELECT 
                DATE_TRUNC('hour', timestamp) as hour,
                AVG(rainfall_1h) as avg_rainfall,
                MAX(rainfall_1h) as max_rainfall
            FROM weather_data
            WHERE location_id = $1
            AND timestamp >= NOW() - INTERVAL '${hours} hours'
            GROUP BY DATE_TRUNC('hour', timestamp)
            ORDER BY hour ASC`,
            [locationId]
        );

        return result.rows;
    }

    // Compare weather between locations
    static async compareLocations(locationIds, period = '24h') {
        const intervalMap = {
            '24h': '24 hours',
            '7d': '7 days',
            '30d': '30 days'
        };

        const interval = intervalMap[period] || '24 hours';

        const result = await db.query(
            `SELECT 
                l.id,
                l.name,
                l.district,
                AVG(wd.temperature) as avg_temp,
                AVG(wd.humidity) as avg_humidity,
                SUM(wd.rainfall_1h) as total_rainfall,
                AVG(wd.wind_speed) as avg_wind_speed
            FROM locations l
            LEFT JOIN weather_data wd ON l.id = wd.location_id
            WHERE l.id = ANY($1)
            AND wd.timestamp >= NOW() - INTERVAL '${interval}'
            GROUP BY l.id, l.name, l.district`,
            [locationIds]
        );

        return result.rows;
    }

    // Delete old weather data (cleanup)
    static async deleteOld(days = 90) {
        const result = await db.query(
            `DELETE FROM weather_data
             WHERE timestamp < NOW() - INTERVAL '${days} days'
             RETURNING id`
        );

        return result.rows.length;
    }

    // Bulk insert weather data
    static async bulkCreate(weatherDataArray) {
        const values = weatherDataArray.map((data, index) => {
            const offset = index * 9;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, 
                     $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
        }).join(',');

        const params = weatherDataArray.flatMap(data => [
            data.location_id,
            data.temperature,
            data.humidity,
            data.rainfall_1h,
            data.rainfall_24h,
            data.wind_speed,
            data.weather_condition,
            data.pressure,
            data.cloud_cover
        ]);

        const result = await db.query(
            `INSERT INTO weather_data 
             (location_id, temperature, humidity, rainfall_1h, rainfall_24h, 
              wind_speed, weather_condition, pressure, cloud_cover)
             VALUES ${values}
             RETURNING id`,
            params
        );

        return result.rows;
    }
}

module.exports = Weather;