require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

// Import routes
const tripRoutes = require('./src/routes/tripRoutes');
const itineraryRoutes = require('./src/routes/itineraryRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allow Vite frontend during local development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint with real DB readiness
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'database_disconnected',
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected,
      name: mongoose.connection.name || 'triptide_db',
      host: mongoose.connection.host || 'unknown',
      readyState: mongoose.connection.readyState
    },
    message: isDbConnected ? 'TripTide backend and MongoDB are operating normally' : 'Backend is running but MongoDB is not connected'
  });
});

// API Routes
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/expenses', expenseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'TripTide — Travel Planner API',
    status: 'online',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      trips: 'GET /api/trips',
      tripStats: 'GET /api/trips/stats/dashboard',
      tripDetails: 'GET /api/trips/:id',
      createTrip: 'POST /api/trips',
      updateTrip: 'PUT /api/trips/:id',
      deleteTrip: 'DELETE /api/trips/:id',
      tripItinerary: 'GET /api/trips/:tripId/itinerary',
      addItinerary: 'POST /api/trips/:tripId/itinerary',
      tripExpenses: 'GET /api/trips/:tripId/expenses',
      addExpense: 'POST /api/trips/:tripId/expenses'
    }
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 TripTide Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
