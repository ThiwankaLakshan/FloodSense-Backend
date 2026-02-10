const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { query } = require('../db/db');
const logger = require('../utils/logger.util');
const riskRules = require('../config/riskRules');

class RiskService {

    async calculateRiskForLocation(locationId) {
        try {
            const locationResult = await query(
                'SELECT * FROM locations WHERE id = $1',
                [locationId]
            );

            if (locationResult.rows.length === 0) {
                throw new Error(`Location ${locationId} not found`);
            }

            const location = locationResult.rows[0];

            // Get latest weather data
            const weatherResult = await query(
                `SELECT * FROM weather_data
                WHERE location_id = $1
                ORDER BY timestamp DESC LIMIT 1`,
                [locationId]
            );

            if (weatherResult.rows.length === 0) {
                logger.warn(`No weather available for location ${locationId}`);
                return null;
            }

            const weather = weatherResult.rows[0];

            // Calculate 24h and 72h rainfall
            const rainfall24h = await this.getRainfall(locationId, 24);
            const rainfall72h = await this.getRainfall(locationId, 72);

            // Get historical flood count
            const floodCountResult = await query(
                `SELECT COUNT(*) as count FROM historical_floods
                WHERE location_id = $1 AND flood_date > NOW() - INTERVAL '5 years'`,
                [locationId]
            );
            const historicalFloodCount = parseInt(floodCountResult.rows[0].count);

            // Calculate risk score using the NEW system (0-12 scale)
            const riskScore = this.calculateRiskScore({
                rainfall24h,
                rainfall72h,
                elevation: location.elevation,
                historicalFloodCount,
                currentRainfall: weather.rainfall_1h
            });

            // Use riskRules to get risk level
            const riskLevel = this.getRiskLevelFromRules(riskScore);

            // Save risk assessment
            await query(
                `INSERT INTO risk_assessments
                (location_id, risk_level, risk_score, rainfall_24h, rainfall_72h)
                VALUES ($1, $2, $3, $4, $5)`,
                [locationId, riskLevel, riskScore, rainfall24h, rainfall72h]
            );

            logger.info(`Risk calculated for ${location.name}: ${riskLevel} (score: ${riskScore})`);

            return {
                location_id: locationId,
                location_name: location.name,
                risk_level: riskLevel,
                risk_score: riskScore,
                rainfall_24h: rainfall24h,
                rainfall_72h: rainfall72h
            };
        } catch (error) {
            logger.error(`Error calculating risk for location ${locationId}: `, error);
            throw error;
        } 
    }

    async getRainfall(locationId, hours) {
        try {
            const result = await query(
                `SELECT SUM(rainfall_1h) as total
                FROM weather_data
                WHERE location_id = $1
                AND timestamp > NOW() - INTERVAL '${hours} hours'`,
                [locationId]
            );

            return parseFloat(result.rows[0]?.total || 0);

        } catch (error) {
            logger.error(`Error getting ${hours}h rainfall for location ${locationId}:`, error);
            throw error;
        }
    }

    // NEW: Calculate score on 0-12 scale matching riskRules.js
    calculateRiskScore({ rainfall24h, rainfall72h, elevation, historicalFloodCount, currentRainfall }) {
        let score = 0;

        // Rainfall 24h factor (0-4 points)
        if (rainfall24h >= 200) score += 4;
        else if (rainfall24h >= 150) score += 3;
        else if (rainfall24h >= 100) score += 2;
        else if (rainfall24h >= 50) score += 1;

        // Rainfall 72h factor (0-4 points)
        if (rainfall72h >= 400) score += 4;
        else if (rainfall72h >= 300) score += 3;
        else if (rainfall72h >= 200) score += 2;
        else if (rainfall72h >= 100) score += 1;

        // Elevation factor (0-3 points)
        if (elevation < 5) score += 3;
        else if (elevation < 10) score += 2;
        else if (elevation < 25) score += 1;

        // Historical flood factor (0-2 points)
        if (historicalFloodCount >= 3) score += 2;
        else if (historicalFloodCount >= 1) score += 1;

        // Season factor (0-2 points)
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const monsoonMonths = [5, 6, 7, 8, 9, 10, 11, 12, 1]; // SW + NE monsoons
        const interMonsoonMonths = [3, 4];

        if (monsoonMonths.includes(currentMonth)) score += 2;
        else if (interMonsoonMonths.includes(currentMonth)) score += 1;

        // Cap at reasonable maximum
        return Math.min(score, 15);
    }

    // NEW: Use riskRules.js to determine level
    getRiskLevelFromRules(score) {
        for (const level of riskRules.riskLevels) {
            if (score >= level.minScore) {
                return level.level;
            }
        }
        return 'LOW';
    }

    // DEPRECATED: Old method - keeping for backwards compatibility
    getRiskLevel(score) {
        // This is now using the NEW scoring system
        return this.getRiskLevelFromRules(score);
    }
}

module.exports = new RiskService();