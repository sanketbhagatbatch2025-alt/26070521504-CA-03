const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
      maxlength: [100, 'Trip name cannot exceed 100 characters']
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: [100, 'Destination cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          if (!this.startDate || !value) return true;
          return new Date(value) >= new Date(this.startDate);
        },
        message: 'End date must be on or after start date'
      }
    },
    estimatedBudget: {
      type: Number,
      required: [true, 'Estimated budget in INR is required'],
      min: [0, 'Budget cannot be negative']
    },
    travelers: {
      type: Number,
      default: 1,
      min: [1, 'Number of travelers must be at least 1']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['Planned', 'Ongoing', 'Completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Planned'
    },
    coverImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating trip duration in days
tripSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.endDate) return 1;
  const diffTime = Math.abs(new Date(this.endDate) - new Date(this.startDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
