import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  Check, 
  Clock, 
  Cpu, 
  AlertOctagon,
  Info
} from 'lucide-react';

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [motors, setMotors] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  async function loadAlerts() {
    setLoading(true);
    try {
      const [alertsRes, motorsRes] = await Promise.all([
        api.getAlerts({
          motor_id: selectedMotor,
          severity: selectedSeverity,
          status: selectedStatus,
        }),
        api.getMotors(),
      ]);

      if (alertsRes.success) setAlerts(alertsRes.data);
      if (motorsRes.success) setMotors(motorsRes.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, [selectedMotor, selectedSeverity, selectedStatus]);

  async function handleAcknowledge(id) {
    setActionLoadingId(id);
    try {
      await api.acknowledgeAlert(id);
      await loadAlerts();
    } catch (err) {
      alert(`Acknowledge failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleResolve(id) {
    setActionLoadingId(id);
    try {
      await api.resolveAlert(id);
      await loadAlerts();
    } catch (err) {
      alert(`Resolve failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Rule-Based Predictive Maintenance Alerts
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            ISO 10816-3 threshold alarms, thermal gradient warnings, and fault resolution audit trail
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadAlerts} title="Refresh Alerts">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Honest Technical Explanation Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--blue-primary)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-body)',
        }}
      >
        <Info size={20} color="var(--blue-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-main)' }}>Engineering System Transparency:</strong>{' '}
          MotorVibe utilizes <em>rule-based predictive maintenance alerts</em> derived from configurable vibration RMS limits (ISO 10816 Zone C & Zone D) and Class F winding thermal thresholds. To prevent alarm flooding, incoming sensor telemetry is evaluated against a 5-minute debounce window before persisting new alert events into PostgreSQL.
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-light)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Filters:</span>
          </div>

          {/* Motor Filter */}
          <div style={{ minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedMotor}
              onChange={(e) => setSelectedMotor(e.target.value)}
            >
              <option value="">All Motors</option>
              {motors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.equipment_code || m.machine_code} - {m.motor_name || m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Warning">Warning Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active Alarms</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {(selectedMotor || selectedSeverity || selectedStatus) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedMotor('');
                setSelectedSeverity('');
                setSelectedStatus('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading plant alarms...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ backgroundColor: 'var(--status-healthy-bg)', color: 'var(--status-healthy)' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 className="empty-state-title">No Active Alerts</h3>
            <p className="empty-state-desc">
              All monitored electric induction motors are currently operating within configured safe thresholds.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Motor Identification</th>
                  <th>Alert Type & Diagnostic Finding</th>
                  <th>Measured vs Threshold</th>
                  <th>Status</th>
                  <th>Timestamp & Acknowledgement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alt) => {
                  const isCritical = alt.severity?.toLowerCase() === 'critical';
                  const isAck = alt.status?.toLowerCase() === 'acknowledged';
                  const isResolved = alt.status?.toLowerCase() === 'resolved';

                  return (
                    <tr key={alt.id}>
                      <td>
                        <span className={`badge badge-${alt.severity.toLowerCase()}`}>
                          {alt.severity}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--blue-primary)', fontFamily: 'var(--font-mono)' }}>
                          {alt.equipment_code || alt.machine_code}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {alt.motor_name || alt.machine_name}
                        </span>
                      </td>

                      <td style={{ maxWidth: '340px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', fontSize: '0.85rem' }}>
                          {alt.alert_type}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block', marginTop: '0.2rem' }}>
                          {alt.message}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        <span style={{ color: isCritical ? 'var(--status-critical)' : 'var(--status-warning)', fontWeight: 800 }}>
                          {alt.measured_value || alt.reading_value}
                        </span>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}> / {alt.threshold_value}</span>
                      </td>

                      <td>
                        <span className={`badge ${isResolved ? 'badge-healthy' : isAck ? 'badge-info' : 'badge-critical'}`}>
                          {alt.status}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div>Logged: {new Date(alt.created_at).toLocaleString()}</div>
                        {alt.acknowledged_at && (
                          <div style={{ color: 'var(--text-light)', marginTop: '0.15rem' }}>
                            Acked: {new Date(alt.acknowledged_at).toLocaleTimeString()} ({alt.acknowledged_by || 'Operator'})
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {!isAck && !isResolved && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAcknowledge(alt.id)}
                              disabled={actionLoadingId === alt.id}
                              title="Acknowledge alert in PostgreSQL"
                            >
                              <Check size={13} />
                              Ack
                            </button>
                          )}

                          {!isResolved && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleResolve(alt.id)}
                              disabled={actionLoadingId === alt.id}
                              title="Resolve alert condition"
                            >
                              <CheckCircle2 size={13} />
                              Resolve
                            </button>
                          )}

                          {isResolved && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--status-healthy)', fontWeight: 600 }}>
                              Completed
                            </span>
                          )}
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
    </div>
  );
}
