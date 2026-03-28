const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main GET endpoint with search and pagination
app.get('/universities', async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM universities';
        let params = [];

        if (search) {
            query += ' WHERE name ILIKE $1 OR country_code ILIKE $1 ORDER BY name ASC LIMIT $2 OFFSET $3';
            params = [`%${search}%`, limit, offset];
        } else {
            query += ' ORDER BY name ASC LIMIT $1 OFFSET $2';
            params = [limit, offset];
        }

        const result = await db.query(query, params);
        
        // Also get total count for pagination UI
        const countResult = search 
            ? await db.query('SELECT count(*) FROM universities WHERE name ILIKE $1 OR country_code ILIKE $1', [`%${search}%`])
            : await db.query('SELECT count(*) FROM universities');

        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch universities', details: err.message });
    }
});

// GET single university
app.get('/universities/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM universities WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Create new university
app.post("/universities", async (req, res) => {
    try {
        const { name, country_code, website } = req.body;
        const result = await db.query(
            "INSERT INTO universities (name, country_code, website) VALUES ($1, $2, $3) RETURNING *",
            [name, country_code, website]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// PUT Update university
app.put("/universities/:id", async (req, res) => {
    try {
        const { name, country_code, website } = req.body;
        const result = await db.query(
            "UPDATE universities SET name = $1, country_code = $2, website = $3 WHERE id = $4 RETURNING *",
            [name, country_code, website, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE university
app.delete("/universities/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE FROM universities WHERE id = $1 RETURNING *", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
