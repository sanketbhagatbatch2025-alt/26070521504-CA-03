import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsSummary from './components/StatsSummary';
import TripCard from './components/TripCard';
import PopularDestinations from './components/PopularDestinations';
import TripModal from './components/TripModal';
import TripDetailView from './components/TripDetailView';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import {
  checkHealth,
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getDashboardStats
} from './services/api';
import {
  Search,
  Filter,
  Plus,
  Compass,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Waves,
  RefreshCw,
  CheckCircle,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'my-trips' | 'destinations'
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Data States
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState(null);
  const [prefillDestination, setPrefillDestination] = useState(null);

  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // System & Health Status
  const [dbStatus, setDbStatus] = useState({ connected: false, name: '' });
  const [toast, setToast] = useState(null);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Verify Backend and MongoDB Health
  const verifyHealth = useCallback(async () => {
    try {
      const res = await checkHealth();
      if (res.database && res.database.connected) {
        setDbStatus({
          connected: true,
          name: res.database.name,
          host: res.database.host
        });
      } else {
        setDbStatus({ connected: false, name: '' });
      }
    } catch (err) {
      setDbStatus({ connected: false, name: '' });
    }
  }, []);

  // Fetch Trips & Dashboard Stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await verifyHealth();

      const [tripsRes, statsRes] = await Promise.all([
        getTrips({
          search: searchTerm,
          status: statusFilter,
          sort: sortBy
        }),
        getDashboardStats()
      ]);

      if (tripsRes.success) {
        setTrips(tripsRes.data || []);
      }
      if (statsRes.success) {
        setStats(statsRes.data || {});
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, verifyHealth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic health check every 15s
  useEffect(() => {
    const timer = setInterval(verifyHealth, 15000);
    return () => clearInterval(timer);
  }, [verifyHealth]);

  // Handle Trip Creation / Updation
  const handleSaveTrip = async (formData) => {
    try {
      if (tripToEdit) {
        await updateTrip(tripToEdit._id, formData);
        showToast('Trip updated successfully!', 'success');
      } else {
        await createTrip(formData);
        showToast('New trip planned successfully! ✈️', 'success');
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setTripToEdit(null);
      setPrefillDestination(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Handle Trip Deletion
  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTrip(tripToDelete._id);
      showToast('Trip and its itinerary/expenses deleted', 'success');
      setTripToDelete(null);
      if (selectedTripId === tripToDelete._id) {
        setSelectedTripId(null);
      }
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenCreateModal = (prefill = null) => {
    setTripToEdit(null);
    setPrefillDestination(prefill);
    setIsTripModalOpen(true);
  };

  const handleOpenEditModal = (trip) => {
    setTripToEdit(trip);
    setPrefillDestination(null);
    setIsTripModalOpen(true);
  };

  const handleViewTrip = (trip) => {
    setSelectedTripId(trip._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered upcoming trips for the dashboard
  const upcomingTrips = trips.filter(
    (t) => t.status === 'Planned' || t.status === 'Ongoing'
  );

  return (
    <div className="app-root">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle size={18} color="#10b981" />
            ) : (
              <AlertCircle size={18} color="#ef4444" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedTripId(null);
          setActiveTab(tab);
        }}
        onPlanTripClick={() => handleOpenCreateModal()}
        dbStatus={dbStatus}
      />

      {/* Backend / MongoDB Disconnected Banner Alert */}
      {!dbStatus.connected && (
        <div className="db-alert-banner">
          <div className="container db-alert-inner">
            <div className="alert-text-side">
              <AlertCircle size={20} color="#dc2626" />
              <div>
                <strong>MongoDB / Backend Unavailable:</strong> Please ensure your backend is running
                (<code style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>npm run dev</code> on port 5000)
                and MongoDB is started at <code>127.0.0.1:27017</code>.
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchData}
              title="Retry connection"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="container main-content-wrap">
        {selectedTripId ? (
          /* Trip Detail & Itinerary View */
          <TripDetailView
            tripId={selectedTripId}
            onBack={() => setSelectedTripId(null)}
            onEditTrip={handleOpenEditModal}
            onDeleteTrip={(t) => setTripToDelete(t)}
            showToast={showToast}
          />
        ) : (
          <>
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-view">
                {/* Hero Banner */}
                <div className="dashboard-hero">
                  <div className="hero-text-col">
                    <div className="hero-subheading">
                      <Sparkles size={16} color="#0d9488" />
                      <span>Smart Travel Planner & Itinerary Organizer</span>
                    </div>
                    <h1 className="hero-headline">
                      Plan your dream journeys with flawless precision.
                    </h1>
                    <p className="hero-description">
                      Keep your destinations, daily itinerary schedules, and travel budgets organized in
                      one beautiful workspace backed by real MongoDB database storage.
                    </p>
                    <div className="hero-cta-group">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={() => handleOpenCreateModal()}
                        id="plan-trip-hero-btn"
                      >
                        <Plus size={20} />
                        <span>Plan a New Trip</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => setActiveTab('my-trips')}
                      >
                        <Compass size={20} />
                        <span>View All Trips ({trips.length})</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <StatsSummary stats={stats} loading={loading} />

                {/* Upcoming Trips Section */}
                <section className="dashboard-upcoming-section">
                  <div className="section-title-bar">
                    <div>
                      <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-deep)' }}>
                        Upcoming & Active Journeys
                      </h2>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Journeys currently planned or underway
                      </p>
                    </div>
                    <button
                      className="view-all-link"
                      onClick={() => setActiveTab('my-trips')}
                    >
                      <span>See all trips ({trips.length})</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  {loading ? (
                    <div className="trips-grid">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '18px' }}></div>
                      ))}
                    </div>
                  ) : upcomingTrips.length === 0 ? (
                    <div className="empty-trips-banner">
                      <Compass size={36} color="#0284c7" />
                      <h3>No upcoming trips right now</h3>
                      <p>Start by planning your next getaway or explore popular destination ideas below!</p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenCreateModal()}
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Plus size={16} />
                        <span>Plan Your First Trip</span>
                      </button>
                    </div>
                  ) : (
                    <div className="trips-grid">
                      {upcomingTrips.slice(0, 3).map((trip) => (
                        <TripCard
                          key={trip._id}
                          trip={trip}
                          onView={handleViewTrip}
                          onEdit={handleOpenEditModal}
                          onDelete={(t) => setTripToDelete(t)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Popular Destinations Inspiration */}
                <PopularDestinations
                  onSelectDestination={(dest) => handleOpenCreateModal(dest)}
                />
              </div>
            )}

            {/* TAB 2: MY TRIPS */}
            {activeTab === 'my-trips' && (
              <div className="my-trips-view">
                <div className="trips-page-header">
                  <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--primary-deep)', marginBottom: '0.3rem' }}>
                      My Travel Journeys
                    </h1>
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>
                      Manage all your saved trips, itineraries, and budgets in MongoDB ({trips.length} Total)
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenCreateModal()}
                    id="my-trips-new-btn"
                  >
                    <Plus size={18} />
                    <span>Plan a Trip</span>
                  </button>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="filter-toolbar card">
                  <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search trips by destination, name, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <div className="filter-group">
                    {/* Status Pill Filters */}
                    <div className="status-pill-filters">
                      {['All', 'Planned', 'Ongoing', 'Completed'].map((status) => (
                        <button
                          key={status}
                          className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                          onClick={() => setStatusFilter(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date-asc">Upcoming First</option>
                      <option value="budget-desc">Budget: High to Low</option>
                      <option value="budget-asc">Budget: Low to High</option>
                      <option value="created-desc">Recently Created</option>
                    </select>
                  </div>
                </div>

                {/* Trips Grid */}
                {loading ? (
                  <div className="trips-grid">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '18px' }}></div>
                    ))}
                  </div>
                ) : trips.length === 0 ? (
                  <div className="empty-trips-banner">
                    <Compass size={44} color="#0284c7" />
                    <h3>No trips match your criteria</h3>
                    <p>Try searching for a different destination or clear your status filters.</p>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('All');
                      }}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <span>Reset Filters</span>
                    </button>
                  </div>
                ) : (
                  <div className="trips-grid">
                    {trips.map((trip) => (
                      <TripCard
                        key={trip._id}
                        trip={trip}
                        onView={handleViewTrip}
                        onEdit={handleOpenEditModal}
                        onDelete={(t) => setTripToDelete(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPLORE DESTINATIONS */}
            {activeTab === 'destinations' && (
              <div className="explore-view">
                <PopularDestinations
                  onSelectDestination={(dest) => handleOpenCreateModal(dest)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer-wrap">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <Waves size={18} color="#ffffff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-deep)' }}>
              TripTide
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>— Travel Planner</span>
          </div>
          <div className="footer-meta">
            <span>Powered by React, Node.js, Express, and MongoDB</span>
            <span className="dot-sep">•</span>
            <span>Database: <code>triptide_db</code></span>
          </div>
        </div>
      </footer>

      {/* Create / Edit Trip Modal */}
      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setTripToEdit(null);
          setPrefillDestination(null);
        }}
        onSave={handleSaveTrip}
        tripToEdit={tripToEdit}
        prefill={prefillDestination}
      />

      {/* Cascading Delete Trip Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(tripToDelete)}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={tripToDelete?.name || ''}
        isDeleting={isDeleting}
      />

      <style>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content-wrap {
          flex: 1;
          padding-top: 2rem;
          padding-bottom: 3rem;
        }

        .db-alert-banner {
          background: #fef2f2;
          border-bottom: 1px solid #fee2e2;
          padding: 0.75rem 0;
        }

        .db-alert-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #991b1b;
        }

        .alert-text-side {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        /* Dashboard Hero */
        .dashboard-hero {
          background: linear-gradient(135deg, #0a2540 0%, #034975 60%, #0d9488 100%);
          border-radius: var(--radius-xl);
          padding: 3rem 2.5rem;
          color: #ffffff;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(10, 37, 64, 0.12);
          position: relative;
          overflow: hidden;
        }

        .dashboard-hero::after {
          content: '';
          position: absolute;
          right: -50px;
          bottom: -50px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(45, 212, 191, 0.18) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .hero-subheading {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          color: #2dd4bf;
          margin-bottom: 1rem;
        }

        .hero-headline {
          font-size: 2.6rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.15;
          max-width: 680px;
          margin-bottom: 1rem;
          letter-spacing: -0.03em;
        }

        .hero-description {
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.85);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: 1.75rem;
        }

        .hero-cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        @media (max-width: 768px) {
          .dashboard-hero {
            padding: 2rem 1.5rem;
          }
          .hero-headline {
            font-size: 1.9rem;
          }
        }

        /* Section Title Bar */
        .section-title-bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--primary-blue);
          padding: 0.3rem 0.5rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .view-all-link:hover {
          color: var(--teal-accent);
          transform: translateX(3px);
        }

        .trips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .empty-trips-banner {
          background: var(--sand-bg);
          border: 2px dashed var(--sand-border);
          border-radius: var(--radius-lg);
          padding: 3.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }

        .empty-trips-banner h3 {
          font-size: 1.25rem;
          color: var(--primary-deep);
          margin-top: 0.35rem;
        }

        .empty-trips-banner p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 400px;
        }

        /* My Trips Header & Toolbar */
        .trips-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .filter-toolbar {
          padding: 1rem 1.25rem;
          margin-bottom: 1.75rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 250px;
          background: var(--bg-app);
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.85rem;
        }

        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 0.9rem;
          font-family: inherit;
          color: var(--text-main);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .status-pill-filters {
          display: flex;
          background: var(--bg-app);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
        }

        .filter-pill {
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .filter-pill:hover {
          color: var(--primary-deep);
        }

        .filter-pill.active {
          background: #ffffff;
          color: var(--primary-blue);
          box-shadow: 0 1px 4px rgba(10,37,64,0.08);
        }

        .sort-select {
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-light);
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-main);
          outline: none;
          cursor: pointer;
        }

        .sort-select:focus {
          border-color: var(--primary-blue);
        }

        /* Footer */
        .footer-wrap {
          background: #ffffff;
          border-top: 1px solid var(--border-light);
          padding: 1.75rem 0;
          margin-top: auto;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-meta {
          font-size: 0.82rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dot-sep {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
