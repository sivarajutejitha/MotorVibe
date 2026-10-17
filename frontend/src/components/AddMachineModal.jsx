import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Plus, AlertCircle } from 'lucide-react';

export function AddMachineModal({ isOpen, onClose, onMachineCreated }) {
  const [formData, setFormData] = useState({
    machine_code: '',
    name: '',
    type: '3-Phase Squirrel Cage Induction Motor',
    location: '',
    rated_power_kw: '',
    rated_rpm: '1480',
    rated_voltage_v: '415',
    rated_current_a: '14.5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.createMachine(formData);
      if (res.success) {
        if (onMachineCreated) onMachineCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to add machine asset.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Industrial Motor Asset</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--red-critical)', color: '#fca5a5', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Machine Code / Tag *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. M-105"
              required
              value={formData.machine_code}
              onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Machine Name / Service *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Auxiliary Cooling Water Pump"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Motor Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="3-Phase Squirrel Cage Induction Motor">3-Phase Squirrel Cage Induction Motor</option>
              <option value="High-Speed Centrifugal Blower Motor">High-Speed Centrifugal Blower Motor</option>
              <option value="Heavy-Duty Helical Screw Compressor Motor">Heavy-Duty Helical Screw Compressor Motor</option>
              <option value="Geared Flange Conveyor Motor">Geared Flange Conveyor Motor</option>
              <option value="Synchronous Industrial Motor">Synchronous Industrial Motor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Plant Bay / Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Boiler House Floor 2"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Rated Power (kW) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="45.0"
                required
                value={formData.rated_power_kw}
                onChange={(e) => setFormData({ ...formData, rated_power_kw: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rated Speed (RPM) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="1480"
                required
                value={formData.rated_rpm}
                onChange={(e) => setFormData({ ...formData, rated_rpm: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Rated Voltage (V)</label>
              <input
                type="number"
                className="form-input"
                value={formData.rated_voltage_v}
                onChange={(e) => setFormData({ ...formData, rated_voltage_v: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rated Current (Amps)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={formData.rated_current_a}
                onChange={(e) => setFormData({ ...formData, rated_current_a: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={16} />
              {loading ? 'Adding...' : 'Add Machine Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
