const API_BASE = '/api';

/**
 * Generic API request handler with error message normalization
 */
async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to TripTide backend server. Please verify backend is running on port 5000.');
    }
    throw error;
  }
}

// Health Check
export const checkHealth = () => apiRequest('/health');

// Dashboard Stats
export const getDashboardStats = () => apiRequest('/trips/stats/dashboard');

// Trips CRUD
export const getTrips = (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.destination) query.append('destination', params.destination);
  if (params.sort) query.append('sort', params.sort);
  
  const queryString = query.toString();
  return apiRequest(`/trips${queryString ? `?${queryString}` : ''}`);
};

export const getTripById = (id) => apiRequest(`/trips/${id}`);

export const createTrip = (tripData) =>
  apiRequest('/trips', {
    method: 'POST',
    body: JSON.stringify(tripData),
  });

export const updateTrip = (id, tripData) =>
  apiRequest(`/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tripData),
  });

export const deleteTrip = (id) =>
  apiRequest(`/trips/${id}`, {
    method: 'DELETE',
  });

// Itinerary CRUD
export const getTripItineraries = (tripId) => apiRequest(`/trips/${tripId}/itinerary`);

export const addItinerary = (tripId, activityData) =>
  apiRequest(`/trips/${tripId}/itinerary`, {
    method: 'POST',
    body: JSON.stringify(activityData),
  });

export const updateItinerary = (id, activityData) =>
  apiRequest(`/itinerary/${id}`, {
    method: 'PUT',
    body: JSON.stringify(activityData),
  });

export const deleteItinerary = (id) =>
  apiRequest(`/itinerary/${id}`, {
    method: 'DELETE',
  });

// Expenses CRUD
export const getTripExpenses = (tripId) => apiRequest(`/trips/${tripId}/expenses`);

export const addExpense = (tripId, expenseData) =>
  apiRequest(`/trips/${tripId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });

export const updateExpense = (id, expenseData) =>
  apiRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expenseData),
  });

export const deleteExpense = (id) =>
  apiRequest(`/expenses/${id}`, {
    method: 'DELETE',
  });
