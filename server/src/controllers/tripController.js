const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Expense = require('../models/Expense');

// Curated high quality destination photos for travel imagery
const defaultCoverImages = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  amalfi: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
  kashmir: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
};

const getDestinationCover = (destName) => {
  if (!destName) return defaultCoverImages.default;
  const lower = destName.toLowerCase();
  for (const [key, url] of Object.entries(defaultCoverImages)) {
    if (lower.includes(key)) return url;
  }
  return defaultCoverImages.default;
};

// @desc    Get all trips with search and status filters
// @route   GET /api/trips
exports.getAllTrips = async (req, res) => {
  try {
    const { destination, status, search, sort } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { startDate: 1 }; // default: upcoming first
    if (sort === 'budget-desc') sortOption = { estimatedBudget: -1 };
    if (sort === 'budget-asc') sortOption = { estimatedBudget: 1 };
    if (sort === 'created-desc') sortOption = { createdAt: -1 };

    const trips = await Trip.find(query).sort(sortOption).lean();

    // Attach expense summary & activity count to each trip for card displays
    const tripsWithSummary = await Promise.all(
      trips.map(async (trip) => {
        const [expenses, activitiesCount] = await Promise.all([
          Expense.aggregate([
            { $match: { tripId: trip._id } },
            { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
          ]),
          Itinerary.countDocuments({ tripId: trip._id })
        ]);

        const totalSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;
        return {
          ...trip,
          totalSpent,
          remainingBudget: Math.max(0, trip.estimatedBudget - totalSpent),
          activitiesCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: tripsWithSummary.length,
      data: tripsWithSummary
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ success: false, message: 'Server error fetching trips', error: error.message });
  }
};

// @desc    Get single trip with its itineraries and expenses
// @route   GET /api/trips/:id
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Fetch associated itineraries sorted chronologically
    const itineraries = await Itinerary.find({ tripId: trip._id }).sort({ date: 1, time: 1 });

    // Fetch associated expenses sorted by date
    const expenses = await Expense.find({ tripId: trip._id }).sort({ date: -1 });

    // Calculate budget metrics
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBudget = trip.estimatedBudget - totalSpent;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        trip,
        itineraries,
        expenses,
        budgetSummary: {
          estimatedBudget: trip.estimatedBudget,
          totalSpent,
          remainingBudget,
          percentUsed: trip.estimatedBudget > 0 ? Math.min(100, Math.round((totalSpent / trip.estimatedBudget) * 100)) : 0,
          categoryBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trip by ID:', error);
    res.status(500).json({ success: false, message: 'Server error fetching trip details', error: error.message });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
exports.createTrip = async (req, res) => {
  try {
    const { name, destination, startDate, endDate, estimatedBudget, travelers, notes, status, coverImage } = req.body;

    // Validation
    if (!name || !destination || !startDate || !endDate || estimatedBudget === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, destination, startDate, endDate, estimatedBudget'
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    const assignedCover = coverImage && coverImage.trim() !== '' 
      ? coverImage 
      : getDestinationCover(destination);

    const trip = await Trip.create({
      name,
      destination,
      startDate,
      endDate,
      estimatedBudget: Number(estimatedBudget),
      travelers: Number(travelers) || 1,
      notes: notes || '',
      status: status || 'Planned',
      coverImage: assignedCover
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing trip
// @route   PUT /api/trips/:id
exports.updateTrip = async (req, res) => {
  try {
    const { startDate, endDate, destination, coverImage } = req.body;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    // Auto update cover if destination changed and coverImage not explicitly given
    let updateData = { ...req.body };
    if (destination && (!coverImage || coverImage.trim() === '')) {
      updateData.coverImage = getDestinationCover(destination);
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: trip
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a trip and cascade delete associated itineraries & expenses
// @route   DELETE /api/trips/:id
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Cascading delete: Remove all itineraries and expenses tied to this trip
    const deletedItineraries = await Itinerary.deleteMany({ tripId: trip._id });
    const deletedExpenses = await Expense.deleteMany({ tripId: trip._id });
    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip and associated itinerary activities and expenses deleted successfully',
      deletedCounts: {
        itineraries: deletedItineraries.deletedCount,
        expenses: deletedExpenses.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ success: false, message: 'Server error deleting trip', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/trips/stats/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const [totalTrips, upcomingTrips, ongoingTrips, completedTrips, budgetAggregate, expenseAggregate] = await Promise.all([
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'Planned', startDate: { $gte: now } }),
      Trip.countDocuments({ status: 'Ongoing' }),
      Trip.countDocuments({ status: 'Completed' }),
      Trip.aggregate([{ $group: { _id: null, totalBudget: { $sum: '$estimatedBudget' } } }]),
      Expense.aggregate([{ $group: { _id: null, totalSpent: { $sum: '$amount' } } }])
    ]);

    const totalBudget = budgetAggregate.length > 0 ? budgetAggregate[0].totalBudget : 0;
    const totalSpent = expenseAggregate.length > 0 ? expenseAggregate[0].totalSpent : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTrips,
        upcomingTrips,
        ongoingTrips,
        completedTrips,
        totalBudget,
        totalSpent,
        totalRemaining: Math.max(0, totalBudget - totalSpent)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching statistics', error: error.message });
  }
};
