import React, { useState } from 'react';
import { Plus, Clock, MapPin, CheckCircle2, Circle, Edit3, Trash2, Calendar, FileText, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ItinerarySection({
  trip,
  itineraries = [],
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    activityName: '',
    date: '',
    time: '10:00 AM',
    location: '',
    notes: '',
    isCompleted: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default date within trip bounds or today
  const defaultDate = trip?.startDate ? trip.startDate.split('T')[0] : '';

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormData({
      activityName: '',
      date: defaultDate,
      time: '10:00 AM',
      location: '',
      notes: '',
      isCompleted: false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act) => {
    setEditingActivity(act);
    setFormData({
      activityName: act.activityName || '',
      date: act.date ? act.date.split('T')[0] : '',
      time: act.time || '10:00 AM',
      location: act.location || '',
      notes: act.notes || '',
      isCompleted: Boolean(act.isCompleted)
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (act) => {
    const nextState = !act.isCompleted;
    if (nextState) {
      // Confetti burst for celebrating completed activity!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    await onUpdateActivity(act._id, { isCompleted: nextState });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.activityName.trim()) errors.activityName = 'Activity name is required';
    if (!formData.date) errors.date = 'Date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingActivity) {
        await onUpdateActivity(editingActivity._id, formData);
      } else {
        await onAddActivity(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group activities by date
  const groupedActivities = itineraries.reduce((groups, item) => {
    const d = item.date ? item.date.split('T')[0] : 'undated';
    if (!groups[d]) groups[d] = [];
    groups[d].push(item);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedActivities).sort();

  return (
    <div className="itinerary-section">
      <div className="itinerary-header">
        <div>
          <h3 className="itinerary-title">Trip Itinerary & Daily Schedule</h3>
          <p className="itinerary-desc">
            Organize daily sights, experiences, and reservations in chronological order.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleOpenAdd}
          id="add-activity-btn"
        >
          <Plus size={16} />
          <span>Add Activity</span>
        </button>
      </div>

      {itineraries.length === 0 ? (
        <div className="empty-itinerary">
          <div className="empty-icon-wrap">
            <Calendar size={32} color="#0284c7" />
          </div>
          <h4>No activities scheduled yet</h4>
          <p>Start organizing your journey by adding sightseeing, reservations, or flights.</p>
          <button className="btn btn-secondary btn-sm" onClick={handleOpenAdd} style={{ marginTop: '0.75rem' }}>
            <Plus size={15} />
            <span>Add First Activity</span>
          </button>
        </div>
      ) : (
        <div className="timeline-container">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="timeline-day-group">
              <div className="timeline-day-badge">
                <Calendar size={14} />
                <span>{dateKey !== 'undated' ? formatDate(dateKey) : 'Flexible'}</span>
              </div>

              <div className="timeline-items">
                {groupedActivities[dateKey].map((act) => (
                  <div
                    key={act._id}
                    className={`timeline-card ${act.isCompleted ? 'completed' : ''}`}
                  >
                    <button
                      className="completion-btn"
                      onClick={() => handleToggleComplete(act)}
                      title={act.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {act.isCompleted ? (
                        <CheckCircle2 size={22} color="#10b981" />
                      ) : (
                        <Circle size={22} color="#cbd5e1" />
                      )}
                    </button>

                    <div className="timeline-card-content">
                      <div className="act-header-row">
                        <h4 className={`act-name ${act.isCompleted ? 'strikethrough' : ''}`}>
                          {act.activityName}
                        </h4>
                        <div className="act-time-pill">
                          <Clock size={12} />
                          <span>{act.time}</span>
                        </div>
                      </div>

                      {act.location && (
                        <div className="act-location">
                          <MapPin size={13} color="#0d9488" />
                          <span>{act.location}</span>
                        </div>
                      )}

                      {act.notes && (
                        <p className="act-notes">{act.notes}</p>
                      )}
                    </div>

                    <div className="act-actions">
                      <button
                        className="action-icon-btn edit-btn"
                        onClick={() => handleOpenEdit(act)}
                        title="Edit Activity"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="action-icon-btn delete-btn"
                        onClick={() => onDeleteActivity(act._id)}
                        title="Delete Activity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                {editingActivity ? 'Edit Activity' : 'Add Itinerary Activity'}
              </h3>
              <button className="action-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formErrors.submit && (
                  <div className="submit-error-banner">{formErrors.submit}</div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="activity-name">Activity Name *</label>
                  <input
                    id="activity-name"
                    type="text"
                    placeholder="e.g. Scuba diving, Museum visit, Sunset cruise"
                    className={`form-input ${formErrors.activityName ? 'error' : ''}`}
                    value={formData.activityName}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  />
                  {formErrors.activityName && (
                    <span className="form-error">{formErrors.activityName}</span>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="activity-date">Date *</label>
                    <input
                      id="activity-date"
                      type="date"
                      className={`form-input ${formErrors.date ? 'error' : ''}`}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {formErrors.date && (
                      <span className="form-error">{formErrors.date}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="activity-time">Time</label>
                    <input
                      id="activity-time"
                      type="text"
                      placeholder="e.g. 10:00 AM, 04:30 PM"
                      className="form-input"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="activity-location">Location / Meeting Point</label>
                  <input
                    id="activity-location"
                    type="text"
                    placeholder="e.g. Vagator Beach, Fort Aguada, City Center"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="activity-notes">Notes / Booking Details</label>
                  <textarea
                    id="activity-notes"
                    rows="3"
                    placeholder="Tickets booked, carry sunscreen, dress code..."
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  id="save-activity-btn"
                >
                  {isSubmitting ? 'Saving...' : editingActivity ? 'Save Changes' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .itinerary-section {
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .itinerary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .itinerary-title {
          font-size: 1.3rem;
          color: var(--primary-deep);
        }

        .itinerary-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .empty-itinerary {
          text-align: center;
          padding: 3rem 1.5rem;
          background: var(--sand-bg);
          border-radius: var(--radius-md);
          border: 1px dashed var(--sand-border);
        }

        .empty-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .empty-itinerary h4 {
          font-size: 1.1rem;
          color: var(--primary-deep);
          margin-bottom: 0.35rem;
        }

        .empty-itinerary p {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 380px;
          margin: 0 auto;
        }

        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .timeline-day-group {
          position: relative;
        }

        .timeline-day-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.8rem;
          background: var(--primary-subtle);
          color: var(--primary-blue);
          border: 1px solid #bae6fd;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 0.85rem;
        }

        .timeline-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-left: 2px solid #e2e8f0;
          margin-left: 0.85rem;
          padding-left: 1.25rem;
        }

        .timeline-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1rem 1.15rem;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          transition: all var(--transition-fast);
          box-shadow: 0 1px 3px rgba(10,37,64,0.03);
          position: relative;
        }

        .timeline-card:hover {
          border-color: #cbd5e1;
          box-shadow: var(--shadow-sm);
        }

        .timeline-card.completed {
          background: #fafcfd;
          border-color: #e2e8f0;
          opacity: 0.85;
        }

        .completion-btn {
          margin-top: 0.15rem;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .timeline-card-content {
          flex: 1;
        }

        .act-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .act-name {
          font-size: 1.02rem;
          font-weight: 600;
          color: var(--primary-deep);
        }

        .act-name.strikethrough {
          text-decoration: line-through;
          color: var(--text-dim);
        }

        .act-time-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--sand-surface);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--sand-border);
          white-space: nowrap;
        }

        .act-location {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.82rem;
          color: var(--teal-accent);
          font-weight: 500;
          margin-bottom: 0.35rem;
        }

        .act-notes {
          font-size: 0.82rem;
          color: var(--text-muted);
          background: var(--sand-bg);
          padding: 0.45rem 0.65rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--sand-border);
          margin-top: 0.4rem;
        }

        .act-actions {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
      `}</style>
    </div>
  );
}
