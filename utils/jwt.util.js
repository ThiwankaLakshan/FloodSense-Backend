// utils/jwt.util.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JWTUtil {
    // Generate access token
    static generateToken(payload, expiresIn = '24h') {
        try {
            return jwt.sign(
                payload,
                config.jwtSecret,
                { expiresIn }
            );
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Token generation failed');
        }
    }

    // Generate refresh token (longer expiry)
    static generateRefreshToken(payload, expiresIn = '7d') {
        try {
            return jwt.sign(
                payload,
                config.jwtSecret,
                { expiresIn }
            );
        } catch (error) {
            console.error('Error generating refresh token:', error);
            throw new Error('Refresh token generation failed');
        }
    }

    // Verify token
    static verifyToken(token) {
        try {
            return jwt.verify(token, config.jwtSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    // Decode token without verification (useful for debugging)
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Extract token from Authorization header
    static extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Invalid authorization format');
        }

        return parts[1];
    }

    // Check if token is expired
    static isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    }

    // Get token expiry date
    static getTokenExpiry(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return null;
            }
            return new Date(decoded.exp * 1000);
        } catch (error) {
            return null;
        }
    }

    // Refresh token if about to expire
    static shouldRefresh(token, bufferMinutes = 30) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            const expiryTime = decoded.exp * 1000;
            const bufferTime = bufferMinutes * 60 * 1000;
            return (expiryTime - Date.now()) < bufferTime;
        } catch (error) {
            return true;
        }
    }
}

module.exports = JWTUtil;