const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directories exist
const uploadsDir = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const exportsDir = path.join(__dirname, 'data', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Middleware
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: CORS_ORIGIN,
  exposedHeaders: ['Content-Disposition', 'X-OrderEdit-Filename', 'X-OrderEdit-Orders', 'X-OrderEdit-Rows'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/xlsx', require('./routes/xlsx'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/couriers', require('./routes/couriers'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/picking', require('./routes/picking'));
app.use('/api/prestashop', require('./routes/prestashop'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Serve static frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
}

function startServer(port = PORT) {
  const server = app.listen(port, () => {
    const address = server.address();
    const activePort = address && typeof address === 'object' ? address.port : port;
    console.log(`✅ OrderEdit backend running on http://localhost:${activePort}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
