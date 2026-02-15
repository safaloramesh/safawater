import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use resolve to get the absolute path to the app directory
const rootDir = path.resolve(__dirname);

const app = express();
const PORT = 3000;
const STORAGE_DIR = path.join(rootDir, 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'data.json');
const DIST_PATH = path.join(rootDir, 'dist');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Debug log to help you see exactly where the server is looking for files
console.log(`Checking frontend directory at: ${DIST_PATH}`);
if (!fs.existsSync(DIST_PATH)) {
    console.error("ERROR: 'dist' folder not found! Your frontend didn't build correctly.");
}

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

// Serve the React frontend static files
app.use(express.static(DIST_PATH));

// SPA routing: send all other requests to index.html
app.get('*', (req, res) => {
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Frontend files (index.html) missing from server. Check build logs.");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Data Storage: ${STORAGE_FILE}`);
});
