const express = require('express');
const router = express.Router();
const {
  updateItineraryActivity,
  deleteItineraryActivity
} = require('../controllers/itineraryController');

router.route('/:id')
  .put(updateItineraryActivity)
  .delete(deleteItineraryActivity);

module.exports = router;
