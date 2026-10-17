import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  Filter, 
  RefreshCw,
  Cpu,
  HelpCircle
} from 'lucide-react';

export function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  async function loadAlerts() {
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (severityFilter !== 'ALL') params.severity = severityFilter;

      const res = await api.getAlerts(params);
      if (res.success) setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  async function handleAcknowledge(id) {
    try {
      const res = await api.acknowledgeAlert(id);
      setActionMsg(res.message);
      loadAlerts();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  }

  async function handleResolve(id) {
    try {
      const res = await api.resolveAlert(id);
      setActionMsg(res.message);
      loadAlerts();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Machinery Fault Alarms & Explainable Diagnostics</h1>
          <p>Rule-based ISO 10816 anomaly detection with root cause analysis and corrective maintenance actions</p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={loadAlerts}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {actionMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-primary)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          {actionMsg}
        </div>
      )}

      {/* EDUCATIONAL DISCLAIMER (VIVA COMPLIANCE REQUIREMENT) */}
      <div style={{
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.84rem',
        color: 'var(--text-muted)'
      }}>
        <HelpCircle size={18} color="var(--cyan-primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div>
          <span style={{ color: '#fff', fontWeight: 700 }}>Explainability Note for Project Evaluation:</span>{' '}
          All alerts generated in MotorVibe are computed using standardized threshold rules (ISO 10816-3 machinery zones, Class F thermal limits, and 110%/140% rated amperage). MotorVibe clearly distinguishes rule-based alarms from predictions made by trained Machine Learning models and does not make unsubstantiated statistical claims.
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '0.3rem' }}>Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Severity Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '0.3rem' }}>Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              className={`btn btn-sm ${severityFilter === sev ? 'btn-emerald' : 'btn-outline'}`}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* ALERTS CARDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.length > 0 ? (
          alerts.map((alt) => {
            const isCrit = alt.severity === 'CRITICAL';
            const isWarn = alt.severity === 'WARNING';
            const sevClass = isCrit ? 'critical' : isWarn ? 'warning' : 'healthy';

            return (
              <div 
                key={alt.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${isCrit ? 'var(--red-critical)' : isWarn ? 'var(--amber-warning)' : 'var(--cyan-primary)'}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${sevClass}`}>
                      {alt.severity}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                      {alt.machine_code}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                      {alt.machine_name}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      ({alt.machine_location})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} />
                      {new Date(alt.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      State: {alt.status}
                    </span>
                  </div>
                </div>

                {/* DIAGNOSTIC MESSAGE & EXPLANATION */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', marginBottom: '0.3rem' }}>
                    {alt.message}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    <span>Telemetry Value: <strong style={{ color: isCrit ? 'var(--red-critical)' : 'var(--amber-warning)' }}>{alt.reading_value}</strong></span>
                    <span>Configured Limit: <strong>{alt.threshold_value}</strong></span>
                  </div>
                </div>

                {/* SUGGESTED MAINTENANCE ACTION */}
                {alt.suggested_action && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    color: '#cbd5e1',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <Wrench size={16} color="var(--emerald-primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div>
                      <strong style={{ color: 'var(--emerald-primary)' }}>Recommended Maintenance Protocol:</strong>{' '}
                      {alt.suggested_action}
                    </div>
                  </div>
                )}

                {/* OPERATOR ACTIONS */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  {alt.status === 'ACTIVE' && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleAcknowledge(alt.id)}
                    >
                      Acknowledge Alert
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' && (
                    <button
                      className="btn btn-emerald btn-sm"
                      onClick={() => handleResolve(alt.id)}
                    >
                      <CheckCircle2 size={14} />
                      Mark as Resolved & Save Log
                    </button>
                  )}

                  {alt.status === 'RESOLVED' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={14} />
                      Resolved on {new Date(alt.resolved_at || alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            <ShieldAlert size={36} color="var(--emerald-primary)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: '#fff', marginBottom: '0.3rem' }}>No Alerts Match Current Filter</h3>
            <p style={{ fontSize: '0.85rem' }}>All machine drive systems operating within normal ISO 10816 baseline thresholds.</p>
          </div>
        )}
      </div>
    </div>
  );
}
