import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AddMotorModal } from '../components/AddMotorModal';
import { EditMotorModal } from '../components/EditMotorModal';
import { MotorDetailsModal } from '../components/MotorDetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IsoSeverityBadge } from '../components/IsoSeverityBadge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Cpu, 
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MotorsPage() {
  const [motors, setMotors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [motorToEdit, setMotorToEdit] = useState(null);
  const [motorToView, setMotorToView] = useState(null);
  const [motorToDelete, setMotorToDelete] = useState(null);

  const navigate = useNavigate();

  async function loadMotors() {
    setLoading(true);
    try {
      const res = await api.getMotors({ search, status: statusFilter });
      if (res.success) {
        setMotors(res.data);
      }
    } catch (err) {
      console.error('Failed to load motors:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMotors();
  }, [statusFilter]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadMotors();
  }

  async function handleDeleteConfirm() {
    if (!motorToDelete) return;
    try {
      await api.deleteMotor(motorToDelete.id);
      setMotorToDelete(null);
      await loadMotors();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  return (
    <div>
      {/* Header and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Industrial Motors Fleet Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Commission, configure safety thresholds, monitor, and maintain physical plant assets
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          Register New Motor
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 320px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search by motor name, equipment code, or location..."
                className="form-control"
                style={{ paddingLeft: '36px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-outline btn-sm">
              Search
            </button>
          </form>

          {/* Health Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-light)" />
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Healthy">Healthy (Zone A/B)</option>
              <option value="Warning">Warning (Zone C)</option>
              <option value="Critical">Critical (Zone D)</option>
              <option value="Offline">Offline</option>
            </select>

            <button className="btn btn-outline btn-sm btn-icon" onClick={loadMotors} title="Refresh Motors">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Motors Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading industrial motor assets...</span>
          </div>
        ) : motors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Cpu size={28} />
            </div>
            <h3 className="empty-state-title">No Motor Assets Found</h3>
            <p className="empty-state-desc">
              {search || statusFilter
                ? 'No motors match your current filter parameters. Try clearing the filters.'
                : 'Get started by registering your first industrial electric induction motor.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={15} />
              Register New Motor
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipment Code</th>
                  <th>Motor Name & Specs</th>
                  <th>Location</th>
                  <th>Rated Power</th>
                  <th>Safety Limits (Vib/Temp)</th>
                  <th>Current RMS</th>
                  <th>Health Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {motors.map((m) => {
                  const rms = Number(m.live?.vibration_rms ?? m.live?.vib_rms ?? 2.2);
                  const status = m.operational_status || m.status || 'Healthy';

                  return (
                    <tr key={m.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-light)' }}>
                        #{m.id}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--blue-primary)', fontFamily: 'var(--font-mono)' }}>
                          {m.equipment_code || m.machine_code}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                          {m.motor_name || m.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Commissioned: {m.installation_date ? new Date(m.installation_date).toLocaleDateString() : 'Active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-body)' }}>
                        {m.location}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {m.rated_power_kw} kW
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <div>Vib: &lt;{m.vibration_warning_threshold} / &lt;{m.vibration_critical_threshold} mm/s</div>
                        <div>Temp: &lt;{m.temperature_warning_threshold} / &lt;{m.temperature_critical_threshold} °C</div>
                      </td>
                      <td>
                        <IsoSeverityBadge rms={rms} />
                      </td>
                      <td>
                        <span className={`badge badge-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-outline btn-sm btn-icon"
                            title="View Motor Details"
                            onClick={() => setMotorToView(m)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-icon"
                            title="Edit Motor"
                            onClick={() => setMotorToEdit(m)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-icon"
                            title="Delete Motor Asset"
                            style={{ color: 'var(--status-critical)' }}
                            onClick={() => setMotorToDelete(m)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Motor Modal */}
      <AddMotorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => loadMotors()}
      />

      {/* Edit Motor Modal */}
      {motorToEdit && (
        <EditMotorModal
          isOpen={!!motorToEdit}
          motor={motorToEdit}
          onClose={() => setMotorToEdit(null)}
          onUpdated={() => loadMotors()}
        />
      )}

      {/* View Motor Details Modal */}
      {motorToView && (
        <MotorDetailsModal
          isOpen={!!motorToView}
          motor={motorToView}
          onClose={() => setMotorToView(null)}
          onNavigateLive={(motorId) => navigate(`/live-monitoring?motor=${motorId}`)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {motorToDelete && (
        <ConfirmDialog
          isOpen={!!motorToDelete}
          title="Decommission Motor Asset?"
          message={`Are you sure you want to delete ${motorToDelete.equipment_code || motorToDelete.machine_code} (${motorToDelete.motor_name || motorToDelete.name})? This will permanently remove all associated historical telemetry and alerts from PostgreSQL.`}
          confirmText="Yes, Delete Motor"
          isDanger={true}
          onCancel={() => setMotorToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
