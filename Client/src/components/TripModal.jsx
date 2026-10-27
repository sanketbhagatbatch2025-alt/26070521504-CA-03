import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, FileText, Image, AlertTriangle } from 'lucide-react';

const presetImages = [
  { label: 'Beach / Ocean', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mountains & Snow', url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tropical & Nature', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Heritage & Palaces', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Temples & Culture', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'City & Architecture', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' }
];

export default function TripModal({ isOpen, onClose, onSave, tripToEdit, prefill }) {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    travelers: 1,
    notes: '',
    status: 'Planned',
    coverImage: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tripToEdit) {
      setFormData({
        name: tripToEdit.name || '',
        destination: tripToEdit.destination || '',
        startDate: tripToEdit.startDate ? tripToEdit.startDate.split('T')[0] : '',
        endDate: tripToEdit.endDate ? tripToEdit.endDate.split('T')[0] : '',
        estimatedBudget: tripToEdit.estimatedBudget ?? '',
        travelers: tripToEdit.travelers || 1,
        notes: tripToEdit.notes || '',
        status: tripToEdit.status || 'Planned',
        coverImage: tripToEdit.coverImage || ''
      });
      setErrors({});
    } else if (prefill) {
      setFormData({
        name: `Trip to ${prefill.name || 'Paradise'}`,
        destination: `${prefill.name}, ${prefill.country || ''}`.replace(/,\s*$/, ''),
        startDate: '',
        endDate: '',
        estimatedBudget: prefill.budget ? parseInt(prefill.budget.replace(/[^0-9]/g, '')) || 40000 : 40000,
        travelers: 2,
        notes: `Exploring ${prefill.name}: ${prefill.tag || 'Sightseeing and relaxation'}.`,
        status: 'Planned',
        coverImage: prefill.image || ''
      });
      setErrors({});
    } else {
      setFormData({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        estimatedBudget: '',
        travelers: 1,
        notes: '',
        status: 'Planned',
        coverImage: ''
      });
      setErrors({});
    }
  }, [tripToEdit, prefill, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Trip name is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be on or after start date';
      }
    }

    if (formData.estimatedBudget === '' || Number(formData.estimatedBudget) < 0) {
      newErrors.estimatedBudget = 'Please enter a valid estimated budget (≥ 0)';
    }

    if (Number(formData.travelers) < 1) {
      newErrors.travelers = 'Must be at least 1 traveler';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        estimatedBudget: Number(formData.estimatedBudget),
        travelers: Number(formData.travelers)
      });
      onClose();
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
              {tripToEdit ? 'Edit Trip' : 'Plan a New Journey'}
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {tripToEdit ? 'Update your travel details' : 'Set your dates, destination, and budget'}
            </span>
          </div>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="submit-error-banner">
                <AlertTriangle size={16} />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Trip Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="trip-name">Trip Name *</label>
              <input
                id="trip-name"
                name="name"
                type="text"
                placeholder="e.g. Goa Beach Escape, Autumn in Kyoto"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Destination */}
            <div className="form-group">
              <label className="form-label" htmlFor="trip-destination">Destination *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="trip-destination"
                  name="destination"
                  type="text"
                  placeholder="e.g. Manali, Bali, Paris, Jaipur"
                  className={`form-input ${errors.destination ? 'error' : ''}`}
                  value={formData.destination}
                  onChange={handleChange}
                />
              </div>
              {errors.destination && <span className="form-error">{errors.destination}</span>}
            </div>

            {/* Dates row */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="trip-start-date">Start Date *</label>
                <input
                  id="trip-start-date"
                  name="startDate"
                  type="date"
                  className={`form-input ${errors.startDate ? 'error' : ''}`}
                  value={formData.startDate}
                  onChange={handleChange}
                />
                {errors.startDate && <span className="form-error">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="trip-end-date">End Date *</label>
                <input
                  id="trip-end-date"
                  name="endDate"
                  type="date"
                  className={`form-input ${errors.endDate ? 'error' : ''}`}
                  value={formData.endDate}
                  onChange={handleChange}
                />
                {errors.endDate && <span className="form-error">{errors.endDate}</span>}
              </div>
            </div>

            {/* Budget & Travelers & Status */}
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label" htmlFor="trip-budget">Budget (₹ INR) *</label>
                <input
                  id="trip-budget"
                  name="estimatedBudget"
                  type="number"
                  min="0"
                  step="500"
                  placeholder="50000"
                  className={`form-input ${errors.estimatedBudget ? 'error' : ''}`}
                  value={formData.estimatedBudget}
                  onChange={handleChange}
                />
                {errors.estimatedBudget && <span className="form-error">{errors.estimatedBudget}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="trip-travelers">Travelers</label>
                <input
                  id="trip-travelers"
                  name="travelers"
                  type="number"
                  min="1"
                  className={`form-input ${errors.travelers ? 'error' : ''}`}
                  value={formData.travelers}
                  onChange={handleChange}
                />
                {errors.travelers && <span className="form-error">{errors.travelers}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="trip-status">Status</label>
                <select
                  id="trip-status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Planned">Planned</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Travel Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="trip-notes">Travel Notes / Highlights</label>
              <textarea
                id="trip-notes"
                name="notes"
                rows="3"
                placeholder="Key sights to visit, flight timings, hotel notes, packing reminders..."
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Cover Image Preset Picker */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Destination Cover Image</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pick a style or enter URL</span>
              </label>

              <div className="preset-images-scroll">
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`preset-thumb-btn ${formData.coverImage === preset.url ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: preset.url }))}
                  >
                    <img src={preset.url} alt={preset.label} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              <input
                type="url"
                name="coverImage"
                placeholder="Or paste custom image URL (https://...)"
                className="form-input"
                style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}
                value={formData.coverImage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="save-trip-btn"
            >
              {isSubmitting ? 'Saving...' : tripToEdit ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
          }
        }

        .submit-error-banner {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md);
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .preset-images-scroll {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .preset-thumb-btn {
          position: relative;
          height: 52px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .preset-thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preset-thumb-btn span {
          position: absolute;
          inset: 0;
          background: rgba(10, 37, 64, 0.6);
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2px;
        }

        .preset-thumb-btn.selected {
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4);
        }

        .preset-thumb-btn.selected span {
          background: rgba(2, 132, 199, 0.7);
        }
      `}</style>
    </div>
  );
}
