require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors());
app.use(express.json());


const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({
            status: 'OK',
            message: 'Server is running',
            database: 'Connected successfully!',
            testQuery: rows[0].solution
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ status: 'Error', message: 'Database connection failed' });
    }
});

app.get('/api/fields', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT f.id, f.name, f.crop, u.name as agent, f.stage, f.status 
            FROM fields f 
            LEFT JOIN users u ON f.agent_id = u.id
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching fields:", error);
        res.status(500).json({ status: 'Error', message: 'Failed to fetch fields from database' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = pool;