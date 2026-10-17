import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDanger ? 'var(--status-critical)' : 'var(--text-main)' }}>
            <AlertTriangle size={20} />
            {title}
          </div>
          <button className="btn btn-outline btn-sm btn-icon" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>
          {message}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
