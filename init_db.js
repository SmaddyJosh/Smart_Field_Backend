require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    console.log('Connecting to database...');
    const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Creating users table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'agent') DEFAULT 'agent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating fields table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fields (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                crop VARCHAR(100) NOT NULL,
                agent_id INT,
                stage VARCHAR(50) DEFAULT 'Planted',
                status ENUM('Active', 'Completed', 'At Risk', 'Pending') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        console.log('Seeding initial data...');
        await pool.query(`
            INSERT INTO users (name, email, password_hash, role) VALUES 
            ('Coordinator Jane', 'admin@multifarm.com', 'hashed_pw_here', 'admin'),
            ('John Doe', 'john@multifarm.com', 'hashed_pw_here', 'agent'),
            ('Jane Smith', 'jane.s@multifarm.com', 'hashed_pw_here', 'agent')
            ON DUPLICATE KEY UPDATE email=email
        `);

        await pool.query(`
            INSERT INTO fields (name, crop, agent_id, stage, status) VALUES 
            ('North Plot A', 'Maize', 2, 'Growing', 'Active'),
            ('South Valley', 'Wheat', 3, 'Planted', 'At Risk'),
            ('East Greenhouse', 'Tomatoes', 2, 'Harvested', 'Completed')
        `);

        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase();
