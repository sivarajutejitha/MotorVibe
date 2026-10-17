import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function EditMotorModal({ isOpen, motor, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    motor_name: '',
    equipment_code: '',
    location: '',
    rated_power_kw: '',
    operational_status: 'Healthy',
    vibration_warning_threshold: '4.50',
    vibration_critical_threshold: '7.10',
    temperature_warning_threshold: '70.00',
    temperature_critical_threshold: '85.00',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (motor) {
      setFormData({
        motor_name: motor.motor_name || motor.name || '',
        equipment_code: motor.equipment_code || motor.machine_code || '',
        location: motor.location || '',
        rated_power_kw: motor.rated_power_kw || '',
        operational_status: motor.operational_status || motor.status || 'Healthy',
        vibration_warning_threshold: motor.vibration_warning_threshold || '4.50',
        vibration_critical_threshold: motor.vibration_critical_threshold || '7.10',
        temperature_warning_threshold: motor.temperature_warning_threshold || '70.00',
        temperature_critical_threshold: motor.temperature_critical_threshold || '85.00',
      });
    }
  }, [motor]);

  if (!isOpen || !motor) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.updateMotor(motor.id, formData);
      if (res.success) {
        onUpdated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update motor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} color="var(--blue-primary)" />
            Edit Motor Asset: {motor.equipment_code || motor.machine_code}
          </div>
          <button className="btn btn-outline btn-sm btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--status-critical-bg)',
                  border: '1px solid var(--status-critical-border)',
                  color: 'var(--status-critical)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid-cols-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Equipment Code</label>
                <input
                  type="text"
                  name="equipment_code"
                  className="form-control"
                  value={formData.equipment_code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Motor Name</label>
                <input
                  type="text"
                  name="motor_name"
                  className="form-control"
                  value={formData.motor_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Plant Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rated Power (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  name="rated_power_kw"
                  className="form-control"
                  value={formData.rated_power_kw}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Status</label>
              <select
                name="operational_status"
                className="form-select"
                value={formData.operational_status}
                onChange={handleChange}
              >
                <option value="Healthy">Healthy (Normal Operation)</option>
                <option value="Warning">Warning (Inspection Recommended)</option>
                <option value="Critical">Critical (Action Required)</option>
                <option value="Offline">Offline (De-energized)</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                Threshold Limits
              </span>

              <div className="grid-cols-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Vibration Warning (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="vibration_warning_threshold"
                    className="form-control"
                    value={formData.vibration_warning_threshold}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vibration Critical (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="vibration_critical_threshold"
                    className="form-control"
                    value={formData.vibration_critical_threshold}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Temperature Warning (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="temperature_warning_threshold"
                    className="form-control"
                    value={formData.temperature_warning_threshold}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temperature Critical (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="temperature_critical_threshold"
                    className="form-control"
                    value={formData.temperature_critical_threshold}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
