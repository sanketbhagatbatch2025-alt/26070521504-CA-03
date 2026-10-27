import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemTitle, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="#dc2626" />
          </div>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
            Delete Trip?
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong style={{ color: '#0f172a' }}>"{itemTitle}"</strong>?
          </p>
          <p style={{ fontSize: '0.82rem', color: '#dc2626', marginTop: '0.5rem', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
            ⚠️ This will also delete all associated itinerary activities and recorded expenses from MongoDB.
          </p>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            id="confirm-delete-btn"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Trip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
