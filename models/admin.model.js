const db = require('../db/db');
const bcrypt = require('bcrypt');

class AdminUser {
    // Create new admin user
    static async create(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            `INSERT INTO admin_users (username, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING id, username, email, created_at`,
            [username, email, hashedPassword]
        );
        
        return result.rows[0];
    }

    // Find admin by username
    static async findByUsername(username) {
        const result = await db.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [username]
        );
        
        return result.rows[0];
    }

    // Find admin by email
    static async findByEmail(email) {
        const result = await db.query(
            'SELECT * FROM admin_users WHERE email = $1',
            [email]
        );
        
        return result.rows[0];
    }

     // Find admin by email
    static async findBUsername(username) {
        try {
            const result = await db.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [username]
        );
        
        return result.rows[0];
        }
        catch(e){
            return null
        }
        
    }
    // Find admin by ID
    static async findById(id) {
        const result = await db.query(
            'SELECT id, username, email, created_at FROM admin_users WHERE id = $1',
            [id]
        );
        
        return result.rows[0];
    }

    // Get all admins
    static async findAll() {
        const result = await db.query(
            'SELECT id, username, email, created_at, updated_at FROM admin_users ORDER BY created_at DESC'
        );
        
        return result.rows;
    }

    // Update admin
    static async update(id, updates) {
        const { username, email, password } = updates;
        let query = 'UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP';
        const values = [];
        let paramCount = 1;

        if (username) {
            query += `, username = $${paramCount}`;
            values.push(username);
            paramCount++;
        }

        if (email) {
            query += `, email = $${paramCount}`;
            values.push(email);
            paramCount++;
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password = $${paramCount}`;
            values.push(hashedPassword);
            paramCount++;
        }

        query += ` WHERE id = $${paramCount} RETURNING id, username, email, updated_at`;
        values.push(id);

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Delete admin
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM admin_users WHERE id = $1 RETURNING id',
            [id]
        );
        
        return result.rows[0];
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        console.log(plainPassword,hashedPassword)
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Check if admin exists
    static async exists(username, email) {
        const result = await db.query(
            'SELECT id FROM admin_users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        return result.rows.length > 0;
    }

    // Change password
    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const result = await db.query(
            'UPDATE admin_users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
            [hashedPassword, id]
        );
        
        return result.rows[0];
    }

    
}

module.exports = AdminUser;