import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { 
  Wrench, 
  Plus, 
  Filter, 
  RefreshCw, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [motors, setMotors] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [maintRes, motorsRes] = await Promise.all([
        api.getMaintenance({ motor_id: selectedMotor }),
        api.getMotors(),
      ]);

      if (maintRes.success) setRecords(maintRes.data);
      if (motorsRes.success) setMotors(motorsRes.data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedMotor]);

  async function handleDeleteConfirm() {
    if (!recordToDelete) return;
    try {
      await api.deleteMaintenance(recordToDelete.id);
      setRecordToDelete(null);
      await loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Machinery Servicing & Maintenance History
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Technician inspection logs, bearing replacements, lubrication schedules, and audit records
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setRecordToEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          Log Maintenance Activity
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={15} color="var(--text-light)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Filter by Motor:</span>
            <select
              className="form-select"
              style={{ width: '260px' }}
              value={selectedMotor}
              onChange={(e) => setSelectedMotor(e.target.value)}
            >
              <option value="">All Plant Motors</option>
              {motors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.equipment_code || m.machine_code} - {m.motor_name || m.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-outline btn-sm" onClick={loadData} title="Refresh Records">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading maintenance records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ backgroundColor: 'var(--blue-subtle)', color: 'var(--blue-primary)' }}>
              <Wrench size={28} />
            </div>
            <h3 className="empty-state-title">No Maintenance Records Found</h3>
            <p className="empty-state-desc">
              Log periodic grease replenishment, bearing servicing, or corrective repair work performed on plant motors.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setRecordToEdit(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={15} />
              Log First Activity
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Motor Asset</th>
                  <th>Classification</th>
                  <th>Observed Issue / Scope</th>
                  <th>Work Performed</th>
                  <th>Servicing Technician</th>
                  <th>Service Date</th>
                  <th>Next Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-light)' }}>
                      #{r.id}
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--blue-primary)', fontFamily: 'var(--font-mono)' }}>
                        {r.equipment_code || r.machine_code}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.motor_name || r.machine_name}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {r.maintenance_type}
                      </span>
                    </td>

                    <td style={{ maxWidth: '240px', fontSize: '0.82rem', color: 'var(--text-body)' }}>
                      {r.description}
                    </td>

                    <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {r.work_performed || r.action_taken}
                    </td>

                    <td style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      {r.technician_name}
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {r.maintenance_date ? new Date(r.maintenance_date).toLocaleDateString() : 'N/A'}
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {r.next_maintenance_date ? new Date(r.next_maintenance_date).toLocaleDateString() : '—'}
                    </td>

                    <td>
                      <span className={`badge ${r.status?.toLowerCase() === 'completed' ? 'badge-healthy' : 'badge-warning'}`}>
                        {r.status || 'Completed'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          title="Edit Maintenance Log"
                          onClick={() => {
                            setRecordToEdit(r);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          title="Delete Record"
                          style={{ color: 'var(--status-critical)' }}
                          onClick={() => setRecordToDelete(r)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log / Edit Maintenance Modal */}
      <LogMaintenanceModal
        isOpen={isModalOpen}
        motors={motors}
        recordToEdit={recordToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setRecordToEdit(null);
        }}
        onRecordSaved={() => loadData()}
      />

      {/* Delete Confirmation Dialog */}
      {recordToDelete && (
        <ConfirmDialog
          isOpen={!!recordToDelete}
          title="Delete Maintenance Record?"
          message={`Are you sure you want to permanently delete maintenance record #${recordToDelete.id} for ${recordToDelete.equipment_code || recordToDelete.machine_code}?`}
          confirmText="Yes, Delete Record"
          isDanger={true}
          onCancel={() => setRecordToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
