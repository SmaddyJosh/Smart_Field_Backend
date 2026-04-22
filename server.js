const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

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
            SELECT f.id, f.name, f.crop, u.name as agent, f.agent_id, f.stage, f.status, DATE_FORMAT(f.created_at, '%Y-%m-%d') as plantedDate
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

app.get('/api/agents', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name FROM users WHERE role = 'agent'");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).json({ status: 'Error', message: 'Failed to fetch agents' });
    }
});

app.post('/api/fields', async (req, res) => {
    try {
        const { name, crop, agent_id } = req.body;
        if (!name || !crop) {
            return res.status(400).json({ status: 'Error', message: 'Name and crop are required' });
        }
        
        const [result] = await pool.query(
            "INSERT INTO fields (name, crop, agent_id, stage, status) VALUES (?, ?, ?, 'Planted', 'Active')",
            [name, crop, agent_id || null]
        );
        res.status(201).json({ status: 'Success', message: 'Field added successfully', insertId: result.insertId });
    } catch (error) {
        console.error("Error adding field:", error);
        res.status(500).json({ status: 'Error', message: 'Failed to insert field into database' });
    }
});

app.put('/api/fields/:id', async (req, res) => {
    try {
        const fieldId = req.params.id;
        const { stage, status } = req.body;
        
        if (!stage || !status) {
            return res.status(400).json({ status: 'Error', message: 'Stage and status are required' });
        }
        
        await pool.query(
            "UPDATE fields SET stage = ?, status = ? WHERE id = ?",
            [stage, status, fieldId]
        );
        res.json({ status: 'Success', message: 'Field updated successfully' });
    } catch (error) {
        console.error("Error updating field:", error);
        res.status(500).json({ status: 'Error', message: 'Failed to update field' });
    }
});

app.use('/api', require('./AuthRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});