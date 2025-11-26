const { Pool } = require('pg');
const logger = require('../utils/logger.util');
const config = require('../config/config');

// Singleton instance
let pool = null;

// Initialize pool (singleton pattern)
function getPool() {
    if (!pool) {
        pool = new Pool(config.database);

        pool.on('connect', () => {
            console.log('Database connected successfully!');
            logger.info('Database connection established');
        });

        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Database connection error:', err.message);
            logger.error('Unexpected database error:', err);
        });

        // Log pool info
        logger.info('Database pool initialized', {
            host: config.database.host,
            port: config.database.port,
            database: config.database.name,
            max: config.database.max || 10
        });
    }

    return pool;
}

// Wrapper function for safe queries
async function query(text, params) {
    const poolInstance = getPool();
    const start = Date.now();

    try {
        const result = await poolInstance.query(text, params);
        const duration = Date.now() - start;

        logger.debug('Executed query', {
            text,
            duration,
            rows: result.rowCount
        });

        return result;

    } catch (error) {
        logger.error('Database query error:', {
            query: text,
            params,
            error: error.message,
            stack: error.stack
        });

        throw error;
    }
}

// Get a client from the pool for transactions
async function getClient() {
    const poolInstance = getPool();
    const client = await poolInstance.connect();
    
    const release = client.release.bind(client);
    
    // Wrapper to log when client is released
    client.release = () => {
        logger.debug('Client released back to pool');
        return release();
    };

    return client;
}

// Transaction helper
async function transaction(callback) {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        logger.debug('Transaction committed successfully');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Transaction rolled back:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Check database connection
async function checkConnection() {
    try {
        const poolInstance = getPool();
        const result = await poolInstance.query('SELECT NOW()');
        logger.info('Database health check passed');
        return true;
    } catch (error) {
        logger.error('Database health check failed:', error);
        return false;
    }
}

// Graceful shutdown
async function closePool() {
    if (pool) {
        try {
            await pool.end();
            pool = null; // Reset singleton
            logger.info('Database pool closed');
            console.log('👋 Database connection closed');
        } catch (error) {
            logger.error('Error closing database pool:', error);
            throw error;
        }
    }
}

module.exports = {
    query,
    getClient,
    transaction,
    checkConnection,
    closePool,
    getPool 
};