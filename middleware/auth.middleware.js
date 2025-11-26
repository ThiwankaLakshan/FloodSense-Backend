// middleware/auth.middleware.js
const JWTUtil = require('../utils/jwt.util');
const AdminUser = require('../models/admin.model');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // Extract token
        const token = JWTUtil.extractTokenFromHeader(authHeader);
        
        // Verify token
        const decoded = JWTUtil.verifyToken(token);
        
        // Attach user info to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };
        
        // Optional: Check if user still exists in DB
        const userExists = await AdminUser.findById(decoded.id);
        if (!userExists) {
            return res.status(401).json({
                error: 'User no longer exists'
            });
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.message === 'Token expired') {
            return res.status(401).json({
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.message === 'Invalid token') {
            return res.status(401).json({
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        
        return res.status(401).json({
            error: 'Authentication failed'
        });
    }
};

// Optional: Verify token without user lookup (faster)
const verifyTokenFast = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = JWTUtil.extractTokenFromHeader(authHeader);
        const decoded = JWTUtil.verifyToken(token);
        
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };
        
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Authentication failed'
        });
    }
};

// Optional: Role-based middleware
const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required'
                });
            }

            // Add role to your JWT payload and check here
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    error: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }
    };
};

module.exports = {
    verifyToken,
    verifyTokenFast,
    requireRole
};