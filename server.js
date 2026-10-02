import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
const distExists = fs.existsSync(distPath);
console.log(`Dist folder exists: ${distExists} at ${distPath}`);

// Serve static files from dist folder (Vite build output)
if (distExists) {
  app.use(express.static(distPath));
  console.log(`Serving static files from ${distPath}`);
} else {
  console.warn(`WARNING: dist folder not found at ${distPath}`);
  console.warn('Make sure to run "npm run build" before starting the server');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', distExists });
});

// API routes (add your API endpoints here)
// Example:
// app.post('/api/tickets', (req, res) => { ... });

// Fallback route: serve index.html for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at ${indexPath}`);
    res.status(404).json({ 
      error: 'Application not found. Please ensure the build was completed successfully.',
      distExists,
      indexPath
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  console.error('Error Stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error',
    path: req.path
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Dist folder path: ${distPath}`);
  console.log(`Dist folder exists: ${distExists}`);
});
