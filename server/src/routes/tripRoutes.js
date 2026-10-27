const express = require('express');
const router = express.Router();
const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getDashboardStats
} = require('../controllers/tripController');

const {
  getTripItineraries,
  addItineraryActivity
} = require('../controllers/itineraryController');

const {
  getTripExpenses,
  addTripExpense
} = require('../controllers/expenseController');

// Dashboard statistics
router.get('/stats/dashboard', getDashboardStats);

// Trip routes
router.route('/')
  .get(getAllTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

// Nested routes for trip's itineraries and expenses
router.route('/:tripId/itinerary')
  .get(getTripItineraries)
  .post(addItineraryActivity);

router.route('/:tripId/expenses')
  .get(getTripExpenses)
  .post(addTripExpense);

module.exports = router;
