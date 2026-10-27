import React from 'react';
import { Compass, Plus, Waves, Database, AlertCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onPlanTripClick, dbStatus }) {
  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Waves size={24} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-name">TripTide</span>
            <span className="brand-tagline">Travel Planner</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${activeTab === 'my-trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-trips')}
          >
            My Trips
          </button>
          <button
            className={`nav-link ${activeTab === 'destinations' ? 'active' : ''}`}
            onClick={() => setActiveTab('destinations')}
          >
            Explore
          </button>
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Live DB Status Pill */}
          <div
            className={`db-status-pill ${dbStatus.connected ? 'connected' : 'disconnected'}`}
            title={dbStatus.connected ? `MongoDB connected (${dbStatus.name || 'triptide_db'})` : 'Backend or MongoDB is unreachable'}
          >
            <span className="status-dot"></span>
            <Database size={13} style={{ marginRight: '2px' }} />
            <span className="status-text">
              {dbStatus.connected ? 'MongoDB Live' : 'Offline'}
            </span>
          </div>

          <button
            className="btn btn-primary"
            onClick={onPlanTripClick}
            id="plan-trip-header-btn"
          >
            <Plus size={18} />
            <span>Plan a Trip</span>
          </button>
        </div>
      </div>

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-light);
          box-shadow: 0 2px 10px rgba(10, 37, 64, 0.04);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0a2540 30%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .brand-tagline {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--teal-accent);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--sand-bg);
          padding: 0.3rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
        }

        .nav-link {
          padding: 0.45rem 1.1rem;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--primary-deep);
        }

        .nav-link.active {
          background: #ffffff;
          color: var(--primary-blue);
          box-shadow: 0 2px 6px rgba(10, 37, 64, 0.08);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .db-status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: all var(--transition-fast);
        }

        .db-status-pill.connected {
          background-color: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .db-status-pill.disconnected {
          background-color: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: currentColor;
          box-shadow: 0 0 8px currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .brand-tagline {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
