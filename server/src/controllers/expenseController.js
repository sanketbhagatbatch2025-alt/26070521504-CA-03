const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

// @desc    Get all expenses for a trip
// @route   GET /api/trips/:tripId/expenses
exports.getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const expenses = await Expense.find({ tripId }).sort({ date: -1 });

    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
      summary: {
        totalSpent,
        remainingBudget: trip.estimatedBudget - totalSpent,
        categoryTotals
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expenses', error: error.message });
  }
};

// @desc    Add an expense to a trip
// @route   POST /api/trips/:tripId/expenses
exports.addTripExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { category, description, amount, date } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (!description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description and amount'
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount cannot be negative'
      });
    }

    const expense = await Expense.create({
      tripId,
      category: category || 'Miscellaneous',
      description,
      amount: Number(amount),
      date: date || Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    if (req.body.amount !== undefined && Number(req.body.amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount cannot be negative'
      });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Server error deleting expense', error: error.message });
  }
};
