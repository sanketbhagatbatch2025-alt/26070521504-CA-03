const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// @desc    Get all itinerary activities for a trip (sorted chronologically)
// @route   GET /api/trips/:tripId/itinerary
exports.getTripItineraries = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const activities = await Itinerary.find({ tripId }).sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error fetching itinerary', error: error.message });
  }
};

// @desc    Add an itinerary activity to a trip
// @route   POST /api/trips/:tripId/itinerary
exports.addItineraryActivity = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { activityName, date, time, location, notes, isCompleted } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (!activityName || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide activityName and date'
      });
    }

    const activity = await Itinerary.create({
      tripId,
      activityName,
      date,
      time: time || '10:00 AM',
      location: location || '',
      notes: notes || '',
      isCompleted: Boolean(isCompleted)
    });

    res.status(201).json({
      success: true,
      message: 'Itinerary activity added successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error adding itinerary activity:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an itinerary activity
// @route   PUT /api/itinerary/:id
exports.updateItineraryActivity = async (req, res) => {
  try {
    const activity = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Itinerary activity not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary activity updated successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error updating itinerary activity:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an itinerary activity
// @route   DELETE /api/itinerary/:id
exports.deleteItineraryActivity = async (req, res) => {
  try {
    const activity = await Itinerary.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Itinerary activity not found' });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Itinerary activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting itinerary activity:', error);
    res.status(500).json({ success: false, message: 'Server error deleting activity', error: error.message });
  }
};
