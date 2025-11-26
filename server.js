const express = require('express');
const cors = require('cors');
const scheduler = require('./services/scheduler.service');
const { timeStamp, error } = require('console');

const logger = require('./utils/logger.util');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.middleware');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });


const adminRoutes = require('./routes/admin.route');
const locationsRoutes = require('./routes/location.route');
const weatherRoutes = require('./routes/weather.route');
const riskRoutes = require('./routes/riskAssessment.route');
const dashboardRoutes = require('./routes/dashboard.route');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});


app.use('/api/admin', adminRoutes);

app.use('/api/locations', locationsRoutes);
app.use('/api/locations',weatherRoutes);
app.use('/api/locations',riskRoutes);
app.use('/api/dashboard',dashboardRoutes);


// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Flood Alert System API',
    status: 'running',
    timestamp: new Date(),
    endpoints: [
      'GET /api/locations',
      'GET /api/locations/:id',
      'GET /API/locations/:id/weather-history',
      'GET /api/locations/:id/risk-history',
      'GET /api/locations/:id/summary'
    ]
   });
});

//health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
    });
});

//start scheduler
scheduler.start();

//404 handler
app.use(notFoundHandler);

//global error handler
app.use(errorHandler);

//handle uncought exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception: ',error);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Weather data collection active`);
});