import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname);

const app = express();
const PORT = 3000;
const DIST_PATH = path.join(rootDir, 'dist');
const STORAGE_DIR = path.join(rootDir, 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'data.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API: Load Data from Docker Volume
app.get('/api/data', (req, res) => {
    if (fs.existsSync(STORAGE_FILE)) {
        res.sendFile(STORAGE_FILE);
    } else {
        res.json({ sales: [], customers: [] });
    }
});

// API: Save Data to Docker Volume
app.post('/api/save', (req, res) => {
    try {
        if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(req.body, null, 2));
        res.send({ status: 'success' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Serve Static Files (CSS/JS)
app.use(express.static(DIST_PATH));

// SPA Fallback: Send index.html for all other routes
app.get('*', (req, res) => {
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (req.path.includes('.')) {
        res.status(404).send("File not found");
    } else {
        res.sendFile(indexPath);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
