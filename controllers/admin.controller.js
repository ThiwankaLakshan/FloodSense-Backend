// controllers/admin.controller.js (updated)
const JWTUtil = require('../utils/jwt.util');
const AdminUser = require('../models/admin.model');
const config = require('../config/config');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }

        const admin = await AdminUser.findByUsername(username);
        
        if (!admin) {
            return res.status(401).json({ 
                error: 'Invalid credentials'
            });
        }
        
        const validPassword = await AdminUser.verifyPassword(password, admin.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ 
                error: 'Invalid credentials'
            });
        }

        
        // Generate tokens using utility
        const tokenPayload = {
            id: admin.id,
            username: admin.username,
            email: admin.email
        };

        const accessToken = JWTUtil.generateToken(tokenPayload, '24h');
        const refreshToken = JWTUtil.generateRefreshToken(tokenPayload, '7d');

        return res.status(200).json({
            message: 'Login successful!',
            token: accessToken,
            refreshToken: refreshToken,
            expiresAt: JWTUtil.getTokenExpiry(accessToken),
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: 'Login failed. Please try again.'
        });
    }
};

const verify = async (req, res) => {
    try {
        return res.status(200).json({
            message: 'Token is valid',
            user: req.user
        });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({ 
            error: 'Verification failed'
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = JWTUtil.verifyToken(refreshToken);

        // Generate new access token
        const tokenPayload = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };

        const newAccessToken = JWTUtil.generateToken(tokenPayload, '24h');

        return res.status(200).json({
            token: newAccessToken,
            expiresAt: JWTUtil.getTokenExpiry(newAccessToken)
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(401).json({
            error: 'Invalid or expired refresh token'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({ 
                error: 'Admin not found'
            });
        }

        return res.status(200).json({
            user: admin
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch profile'
        });
    }
};

module.exports = {
    login,
    verify,
    refreshToken,
    getProfile
};