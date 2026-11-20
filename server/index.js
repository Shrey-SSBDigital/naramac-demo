const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes (Clean MVC Pattern with absolute directory resolution)
app.use('/api/live-workflow', require(path.join(__dirname, 'routes/liveWorkflowRoutes')));
app.use('/api/stakeholders', require(path.join(__dirname, 'routes/stakeholderRoutes')));
app.use('/api/traceability', require(path.join(__dirname, 'routes/traceabilityRoutes')));
app.use('/api/identifiers', require(path.join(__dirname, 'routes/identifiers')));
app.use('/api/workflow', require(path.join(__dirname, 'routes/workflowRoutes')));
app.use('/api/qr', require(path.join(__dirname, 'routes/qrRoutes')));
app.use('/api/stats', require(path.join(__dirname, 'routes/stats')));
app.use('/api/gis', require(path.join(__dirname, 'routes/gisRoutes')));

// Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'NERAMAC Agarwood Supply Chain Traceability System (ASCTS)',
    version: '2.0.0-DEMO',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if dist folder exists
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
  console.log(`[Static] Serving frontend from ${clientDist}`);
}

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Start Server only if run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` NERAMAC Agarwood Supply Chain Traceability System (ASCTS)`);
    console.log(` Server & Full Stack Application running on: http://localhost:${PORT}`);
    console.log(`================================================================`);
  });
}

module.exports = app;
