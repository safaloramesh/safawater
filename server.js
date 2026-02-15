import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// These lines are required to recreate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const STORAGE_DIR = path.join(__dirname, 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'data.json');

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
        // Ensure the storage directory exists
        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
        }
        
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(req.body, null, 2));
        res.send({ status: 'success' });
    } catch (err) {
        console.error("Save error:", err.message);
        res.status(500).send({ error: err.message });
    }
});

// Serve the React frontend from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// SPA routing: send all other requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Storage path: ${STORAGE_FILE}`);
});
