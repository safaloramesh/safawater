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

// 1. Diagnostic Log
console.log("Checking for index.html at:", path.join(DIST_PATH, 'index.html'));

// 2. API Routes (Must be above static files)
app.get('/api/data', (req, res) => {
    if (fs.existsSync(STORAGE_FILE)) {
        res.sendFile(STORAGE_FILE);
    } else {
        res.json({ sales: [], customers: [] });
    }
});

app.post('/api/save', (req, res) => {
    try {
        if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(req.body, null, 2));
        res.send({ status: 'success' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 3. Serve Static Files
// This allows the browser to find files in the /assets folder
app.use(express.static(DIST_PATH));

// 4. Wildcard / SPA Routing
app.get('*', (req, res) => {
    const indexPath = path.join(DIST_PATH, 'index.html');
    
    // If browser asks for a specific file (like .js) that doesn't exist, 
    // don't send index.html, send a 404.
    if (req.path.includes('.')) {
        res.status(404).send("File not found");
    } else if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("<h1>System Error</h1><p>Build folder (dist) missing.</p>");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Storage path: ${STORAGE_FILE}`);
});
