import React from 'react';
import { Calendar, MapPin, Users, Wallet, ArrowRight, Edit3, Trash2 } from 'lucide-react';

export default function TripCard({ trip, onView, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const spentPercent = trip.estimatedBudget > 0 
    ? Math.min(100, Math.round(((trip.totalSpent || 0) / trip.estimatedBudget) * 100))
    : 0;

  const statusClass = (trip.status || 'planned').toLowerCase();

  return (
    <div className="trip-card">
      {/* Cover Image Container */}
      <div className="card-media">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={trip.destination}
          loading="lazy"
        />
        <div className="card-media-overlay"></div>
        <span className={`badge-status ${statusClass}`}>
          {trip.status}
        </span>
        <div className="card-travelers-chip">
          <Users size={12} />
          <span>{trip.travelers} {trip.travelers > 1 ? 'Travelers' : 'Traveler'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body">
        <div className="destination-row">
          <MapPin size={15} color="#0d9488" />
          <span className="destination-name">{trip.destination}</span>
        </div>

        <h3 className="trip-title" title={trip.name}>
          {trip.name}
        </h3>

        <div className="trip-dates">
          <Calendar size={14} color="#64748b" />
          <span>
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
          {trip.durationDays && (
            <span className="duration-pill">{trip.durationDays}d</span>
          )}
        </div>

        {/* Budget Bar */}
        <div className="budget-section">
          <div className="budget-header">
            <span className="budget-label">
              <Wallet size={13} style={{ verticalAlign: '-1px' }} /> Budget
            </span>
            <span className="budget-amounts">
              <strong style={{ color: '#0f172a' }}>{formatINR(trip.totalSpent || 0)}</strong>
              <span style={{ color: '#94a3b8' }}> / {formatINR(trip.estimatedBudget)}</span>
            </span>
          </div>
          <div className="budget-track">
            <div
              className="budget-fill"
              style={{
                width: `${spentPercent}%`,
                background: spentPercent > 90 ? '#ef4444' : spentPercent > 60 ? '#f59e0b' : '#0d9488'
              }}
            ></div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-actions">
          <button
            className="btn btn-primary btn-sm view-btn"
            onClick={() => onView(trip)}
            id={`view-trip-${trip._id}`}
          >
            <span>Itinerary & Details</span>
            <ArrowRight size={14} />
          </button>

          <div className="sub-actions">
            <button
              className="action-icon-btn edit-btn"
              onClick={() => onEdit(trip)}
              title="Edit Trip Details"
              aria-label="Edit Trip"
            >
              <Edit3 size={15} />
            </button>
            <button
              className="action-icon-btn delete-btn"
              onClick={() => onDelete(trip)}
              title="Delete Trip"
              aria-label="Delete Trip"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .trip-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
        }

        .trip-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: #cbd5e1;
        }

        .card-media {
          height: 180px;
          position: relative;
          overflow: hidden;
        }

        .card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .trip-card:hover .card-media img {
          transform: scale(1.04);
        }

        .card-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,37,64,0.4) 0%, rgba(10,37,64,0) 40%, rgba(10,37,64,0.3) 100%);
        }

        .card-media .badge-status {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .card-travelers-chip {
          position: absolute;
          bottom: 0.85rem;
          right: 0.85rem;
          background: rgba(10, 37, 64, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .destination-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.35rem;
        }

        .destination-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--teal-accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .trip-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-deep);
          margin-bottom: 0.6rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .trip-dates {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.1rem;
        }

        .duration-pill {
          background: var(--sand-surface);
          color: var(--text-main);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--sand-border);
        }

        .budget-section {
          background: var(--sand-bg);
          border: 1px solid var(--sand-border);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.85rem;
          margin-bottom: 1.25rem;
        }

        .budget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          margin-bottom: 0.4rem;
        }

        .budget-label {
          color: var(--text-muted);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .budget-track {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .budget-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        .card-actions {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          padding-top: 0.5rem;
        }

        .view-btn {
          flex: 1;
        }

        .sub-actions {
          display: flex;
          gap: 0.35rem;
        }

        .action-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background: #ffffff;
          transition: all var(--transition-fast);
        }

        .action-icon-btn:hover.edit-btn {
          color: var(--primary-blue);
          border-color: var(--primary-light);
          background: var(--primary-subtle);
        }

        .action-icon-btn:hover.delete-btn {
          color: #ef4444;
          border-color: #fecaca;
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
}
