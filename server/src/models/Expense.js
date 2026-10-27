const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: {
        values: [
          'Transport',
          'Accommodation',
          'Food & Dining',
          'Activities & Sightseeing',
          'Shopping',
          'Miscellaneous'
        ],
        message: '{VALUE} is not a valid category'
      },
      default: 'Miscellaneous'
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [150, 'Description cannot exceed 150 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount in INR is required'],
      min: [0, 'Amount must be greater than or equal to 0']
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.index({ tripId: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
