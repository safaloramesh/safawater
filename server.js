const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const STORAGE_FILE = path.join(__dirname, 'storage', 'data.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// GET: Load data from the Docker Volume
app.get('/api/data', (req, res) => {
    if (fs.existsSync(STORAGE_FILE)) {
        res.sendFile(STORAGE_FILE);
    } else {
        res.json({ sales: [], customers: [] });
    }
});

// POST: Save data to the Docker Volume
app.post('/api/save', (req, res) => {
    try {
        if (!fs.existsSync(path.join(__dirname, 'storage'))) {
            fs.mkdirSync(path.join(__dirname, 'storage'));
        }
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(req.body, null, 2));
        res.send({ status: 'success' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Serve the React frontend from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
