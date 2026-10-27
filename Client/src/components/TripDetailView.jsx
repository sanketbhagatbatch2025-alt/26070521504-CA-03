import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Clock,
  Edit3,
  Trash2,
  ListTodo,
  PieChart,
  FileText,
  AlertCircle
} from 'lucide-react';
import ItinerarySection from './ItinerarySection';
import BudgetSection from './BudgetSection';
import {
  getTripById,
  addItinerary,
  updateItinerary,
  deleteItinerary,
  addExpense,
  updateExpense,
  deleteExpense
} from '../services/api';

export default function TripDetailView({
  tripId,
  onBack,
  onEditTrip,
  onDeleteTrip,
  showToast
}) {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('itinerary'); // 'itinerary' | 'budget' | 'overview'

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTripById(tripId);
      if (res.success) {
        setTripData(res.data);
      } else {
        setError(res.message || 'Failed to load trip details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // Itinerary handlers
  const handleAddActivity = async (activityData) => {
    try {
      const res = await addItinerary(tripId, activityData);
      showToast('Activity added to itinerary', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleUpdateActivity = async (id, activityData) => {
    try {
      await updateItinerary(id, activityData);
      showToast('Activity updated', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await deleteItinerary(id);
      showToast('Activity removed from itinerary', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Expense handlers
  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(tripId, expenseData);
      showToast('Expense recorded', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      await updateExpense(id, expenseData);
      showToast('Expense updated', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      showToast('Expense deleted', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="trip-detail-loading">
        <div className="detail-banner skeleton" style={{ height: '260px' }}></div>
        <div style={{ marginTop: '2rem' }} className="skeleton" style={{ height: '400px' }}></div>
      </div>
    );
  }

  if (error || !tripData) {
    return (
      <div className="trip-detail-error">
        <AlertCircle size={40} color="#ef4444" />
        <h3>Failed to load trip</h3>
        <p>{error || 'Trip not found'}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Trips</span>
        </button>
      </div>
    );
  }

  const { trip, itineraries, expenses, budgetSummary } = tripData;
  const statusClass = (trip.status || 'planned').toLowerCase();

  return (
    <div className="trip-detail-container">
      {/* Back Button & Breadcrumbs */}
      <div className="detail-top-nav">
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to My Trips</span>
        </button>
        <div className="detail-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEditTrip(trip)}
          >
            <Edit3 size={14} />
            <span>Edit Trip</span>
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDeleteTrip(trip)}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="trip-hero-banner">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.destination}
          className="hero-bg-img"
        />
        <div className="hero-gradient-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge-row">
            <span className={`badge-status ${statusClass}`}>{trip.status}</span>
            <div className="hero-chip">
              <Users size={13} />
              <span>{trip.travelers} {trip.travelers > 1 ? 'Travelers' : 'Traveler'}</span>
            </div>
            {trip.durationDays && (
              <div className="hero-chip">
                <Clock size={13} />
                <span>{trip.durationDays} Days</span>
              </div>
            )}
          </div>

          <h1 className="hero-title">{trip.name}</h1>

          <div className="hero-meta-row">
            <div className="meta-item">
              <MapPin size={17} color="#2dd4bf" />
              <span>{trip.destination}</span>
            </div>
            <div className="meta-item">
              <Calendar size={17} color="#38bdf8" />
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
            </div>
            <div className="meta-item">
              <Wallet size={17} color="#fde047" />
              <span>Estimated Budget: {formatINR(trip.estimatedBudget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${activeSubTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('itinerary')}
        >
          <ListTodo size={17} />
          <span>Itinerary & Schedule ({itineraries?.length || 0})</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('budget')}
        >
          <PieChart size={17} />
          <span>Budget & Expenses ({expenses?.length || 0})</span>
        </button>
        <button
          className={`subtab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          <FileText size={17} />
          <span>Overview & Notes</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="subtab-content">
        {activeSubTab === 'itinerary' && (
          <ItinerarySection
            trip={trip}
            itineraries={itineraries}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {activeSubTab === 'budget' && (
          <BudgetSection
            trip={trip}
            expenses={expenses}
            budgetSummary={budgetSummary}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeSubTab === 'overview' && (
          <div className="overview-tab-card card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-deep)' }}>
              Trip Notes & Summary
            </h3>
            {trip.notes ? (
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {trip.notes}
              </p>
            ) : (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                No travel notes added yet. Click "Edit Trip" to add notes, flight references, or hotel confirmation codes.
              </p>
            )}

            <div className="overview-meta-box">
              <div className="meta-box-item">
                <span className="box-label">Trip Status</span>
                <span className={`badge-status ${statusClass}`}>{trip.status}</span>
              </div>
              <div className="meta-box-item">
                <span className="box-label">Travel Party</span>
                <span className="box-val">{trip.travelers} Person(s)</span>
              </div>
              <div className="meta-box-item">
                <span className="box-label">Start Date</span>
                <span className="box-val">{formatDate(trip.startDate)}</span>
              </div>
              <div className="meta-box-item">
                <span className="box-label">End Date</span>
                <span className="box-val">{formatDate(trip.endDate)}</span>
              </div>
              <div className="meta-box-item">
                <span className="box-label">Total Duration</span>
                <span className="box-val">{trip.durationDays || 1} Days</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .trip-detail-container {
          padding-bottom: 4rem;
        }

        .detail-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .back-link-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary-deep);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }

        .back-link-btn:hover {
          background: var(--sand-surface);
          color: var(--primary-blue);
        }

        .detail-header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .trip-hero-banner {
          position: relative;
          height: 280px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 37, 64, 0.3) 0%,
            rgba(10, 37, 64, 0.85) 100%
          );
        }

        .hero-content {
          position: absolute;
          inset: 0;
          padding: 2rem 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          color: #ffffff;
        }

        .hero-badge-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.65rem;
        }

        .hero-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .hero-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.65rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          line-height: 1.2;
        }

        .hero-meta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1.5rem;
          font-size: 0.925rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .subtabs-bar {
          display: flex;
          gap: 0.75rem;
          border-bottom: 2px solid var(--border-light);
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }

        .subtab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.25rem;
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .subtab-btn:hover {
          color: var(--primary-deep);
        }

        .subtab-btn.active {
          color: var(--primary-blue);
          border-bottom-color: var(--primary-blue);
        }

        .overview-tab-card {
          padding: 1.75rem;
        }

        .overview-meta-box {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1.25rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-light);
        }

        .meta-box-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .box-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .box-val {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--primary-deep);
        }

        .trip-detail-error {
          text-align: center;
          padding: 4rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
}
