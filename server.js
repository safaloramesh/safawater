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

app.use(cors());
app.use(express.json());

// 1. Force the server to tell us if it sees the files in the log
console.log("Checking for index.html at:", path.join(DIST_PATH, 'index.html'));

// 2. Serve static files FIRST
app.use(express.static(DIST_PATH));

// 3. API Routes
app.get('/api/data', (req, res) => {
    res.json({ sales: [], customers: [] });
});

// 4. Wildcard - Send index.html or an error message
app.get('*', (req, res) => {
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // If you see this message on your white screen, the build failed!
        res.status(404).send("<h1>System Error</h1><p>The frontend build folder (dist) is empty. Please check your Docker build logs.</p>");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});
