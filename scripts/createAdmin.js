const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const e = require('express');
require('dotenv').config();


async function createAdmin() {
    try {

        const username = 'admin';
        const password = 'Admin@123';
        const email = 'admin@floodalert.lk';

        const passwordHash = await bcrypt.hash(password, 10);

        const existingAdmin = await  db.query(
            `SELECT * FROM admin_users WHERE username = $1`,
            [username]
        );

        if(existingAdmin.rows.length > 0) {
            console.log('❌ Admin user already exists!');
            console.log('Username:', existingAdmin.rows[0].username);
            console.log('Created:', existingAdmin.rows[0].created_at);
            console.log('\nTo reset password, run:');
            console.log(`DELETE FROM admin_users WHERE username = 'admin';`);
            console.log('Then run this script again.');
            process.exit(1);
        }

        await  db.query(
            `INSERT INTO admin_users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email, created_at`,
            [username, passwordHash, email]
        );

        console.log('Admin User Created!');

    } catch (error) {
        console.error('Error creating admin user: ', error);
    }
    
}

createAdmin();