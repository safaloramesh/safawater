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
const STORAGE_DIR = path.join(rootDir, 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'data.json');
const DIST_PATH = path.join(rootDir, 'dist');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. API: Load data from Volume
app.get('/api/data', (req, res) => {
    if (fs.existsSync(STORAGE_FILE)) {
        res.sendFile(STORAGE_FILE);
    } else {
        res.json({ sales: [], customers: [] });
    }
});

// 2. API: Save data to Volume
app.post('/api/save', (req, res) => {
    try {
        if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(req.body, null, 2));
        res.send({ status: 'success' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 3. Serve Frontend Static Files
app.use(express.static(DIST_PATH));

// 4. Handle SPA routing (Send index.html for unknown routes)
app.get('*', (req, res) => {
    if (req.path.includes('.')) {
        res.status(404).send("File not found");
    } else {
        res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving frontend from: ${DIST_PATH}`);
});
