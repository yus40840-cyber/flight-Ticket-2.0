import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { execSync } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Ensure a production build exists before serving the app.
// This prevents the deployment from failing when the host starts the server
// without running a prior build step.
if (!fs.existsSync(indexPath)) {
  console.log('dist/index.html not found. Running Vite build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    console.error('Build failed during server startup.');
    console.error(error);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder (Vite build output)
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', distExists: fs.existsSync(indexPath) });
});

// API routes (add your API endpoints here)
// app.get('/api/test', (req, res) => res.json({ ok: true }));

// Fallback route: serve index.html for client-side routing
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
    return;
  }

  res.status(404).json({
    error: 'Frontend build not found. Please make sure the app has built successfully.',
    distPath,
    indexPath,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Serving frontend from: ${distPath}`);
});
