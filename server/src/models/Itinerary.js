const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true
    },
    activityName: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [120, 'Activity name cannot exceed 120 characters']
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required']
    },
    time: {
      type: String,
      trim: true,
      default: '10:00 AM'
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for chronological query
itinerarySchema.index({ tripId: 1, date: 1, time: 1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
