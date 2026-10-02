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
    // Set environment to production and suppress interactive prompts
    const buildOutput = execSync('npm run build 2>&1', {
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 120000, // 2 minute timeout
    });
    console.log('Build output:\n', buildOutput);

    // After build, verify the output was created
    if (!fs.existsSync(indexPath)) {
      throw new Error(
        `Build completed but dist/index.html was not created. Build may have failed silently.\n${buildOutput}`
      );
    }
    console.log('✓ Build successful. dist/index.html exists.');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Build FAILED:');
    console.error(errorMsg);
    console.error('\n--- Build Error Details ---');
    console.error('This is why the application could not start.');
    console.error('Fix the errors above and redeploy.\n');
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder (Vite build output)
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: false
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    distExists: fs.existsSync(indexPath),
    timestamp: new Date().toISOString()
  });
});

// API routes (add your API endpoints here)
// app.get('/api/test', (req, res) => res.json({ ok: true }));

// Fallback route: serve index.html for client-side routing
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
    return;
  }

  res.status(500).json({
    error: 'Frontend build artifacts not found',
    details: 'The Vite build did not produce dist/index.html. Check server logs for build errors.',
    distPath,
    indexPath,
    distExists: fs.existsSync(distPath),
    distContents: fs.existsSync(distPath) ? fs.readdirSync(distPath) : []
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Express Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Serving frontend from: ${distPath}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/health\n`);
});
