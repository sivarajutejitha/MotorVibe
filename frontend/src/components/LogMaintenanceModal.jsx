import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Wrench, AlertCircle } from 'lucide-react';

export function LogMaintenanceModal({ isOpen, onClose, motors = [], recordToEdit = null, onRecordSaved }) {
  const [formData, setFormData] = useState({
    motor_id: motors[0]?.id || 1,
    technician_name: '',
    maintenance_type: 'Preventive Maintenance',
    description: '',
    work_performed: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    next_maintenance_date: '',
    status: 'Completed',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        motor_id: recordToEdit.motor_id || recordToEdit.machine_id || motors[0]?.id || 1,
        technician_name: recordToEdit.technician_name || '',
        maintenance_type: recordToEdit.maintenance_type || 'Preventive Maintenance',
        description: recordToEdit.description || '',
        work_performed: recordToEdit.work_performed || recordToEdit.action_taken || '',
        maintenance_date: recordToEdit.maintenance_date ? new Date(recordToEdit.maintenance_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        next_maintenance_date: recordToEdit.next_maintenance_date ? new Date(recordToEdit.next_maintenance_date).toISOString().split('T')[0] : '',
        status: recordToEdit.status || 'Completed',
      });
    } else {
      setFormData({
        motor_id: motors[0]?.id || 1,
        technician_name: '',
        maintenance_type: 'Preventive Maintenance',
        description: '',
        work_performed: '',
        maintenance_date: new Date().toISOString().split('T')[0],
        next_maintenance_date: '',
        status: 'Completed',
      });
    }
  }, [recordToEdit, motors, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (recordToEdit) {
        res = await api.updateMaintenance(recordToEdit.id, formData);
      } else {
        res = await api.createMaintenance(formData);
      }

      if (res.success) {
        if (onRecordSaved) onRecordSaved(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save maintenance record.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={20} color="var(--blue-primary)" />
            {recordToEdit ? `Edit Maintenance Record #${recordToEdit.id}` : 'Log Motor Servicing & Maintenance'}
          </div>
          <button className="btn btn-outline btn-sm btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

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
              margin: '1rem 1.5rem 0',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-cols-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Target Motor Asset *</label>
                <select
                  className="form-select"
                  value={formData.motor_id}
                  onChange={(e) => setFormData({ ...formData, motor_id: Number(e.target.value) })}
                  disabled={!!recordToEdit}
                >
                  {motors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.equipment_code || m.machine_code} - {m.motor_name || m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Technician Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Arun Patel (Senior Tech)"
                  required
                  value={formData.technician_name}
                  onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Maintenance Classification *</label>
                <select
                  className="form-select"
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                >
                  <option value="Routine Inspection">Routine Inspection (Visual & Thermal)</option>
                  <option value="Preventive Maintenance">Preventive Maintenance (Scheduled Servicing)</option>
                  <option value="Corrective Repair">Corrective Repair (Defect Rectification)</option>
                  <option value="Bearing Replacement">Bearing Replacement (Drive End / Non-Drive End)</option>
                  <option value="Lubrication & Greasing">Lubrication & Greasing</option>
                  <option value="Dynamic Balancing">Dynamic Rotor Balancing</option>
                  <option value="Laser Alignment">Laser Shaft Alignment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Service Status *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Maintenance Date *</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={formData.maintenance_date}
                  onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Scheduled Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.next_maintenance_date}
                  onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description of Issue / Scope *</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Observed abnormal noise, high vibration harmonics, rising thermal gradient..."
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Performed / Remedial Action *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Disassembled coupling, replaced SKF Explorer deep groove bearing, torqued foundation bolts..."
                required
                value={formData.work_performed}
                onChange={(e) => setFormData({ ...formData, work_performed: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : recordToEdit ? 'Save Changes' : 'Record Service Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
