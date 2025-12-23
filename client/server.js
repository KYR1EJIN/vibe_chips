/**
 * Simple static file server for client in production
 * Serves the Vite build output
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const app = express();

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Serve index.html for all routes (SPA routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Client server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
});

