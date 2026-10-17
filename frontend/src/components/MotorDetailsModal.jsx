import React from 'react';
import { X, Cpu, Activity, AlertTriangle, Wrench, Shield, CheckCircle, Clock } from 'lucide-react';
import { IsoSeverityBadge } from './IsoSeverityBadge';

export function MotorDetailsModal({ isOpen, motor, onClose, onNavigateLive }) {
  if (!isOpen || !motor) return null;

  const rms = Number(motor.live?.vib_rms ?? motor.live?.vibration_rms ?? 2.2);
  const temp = Number(motor.live?.temperature ?? motor.live?.temperature_c ?? 52.0);
  const curr = Number(motor.live?.current ?? motor.live?.current_a ?? 9.2);
  const healthScore = motor.live?.health?.overall ?? (motor.operational_status === 'Healthy' ? 92 : motor.operational_status === 'Warning' ? 68 : 42);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} color="var(--blue-primary)" />
            <div>
              <span>{motor.equipment_code || motor.machine_code} — {motor.motor_name || motor.name}</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 400 }}>
                {motor.location}
              </span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status & Health Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                Operational Condition
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                <span className={`badge badge-${(motor.operational_status || motor.status || 'healthy').toLowerCase()}`}>
                  {motor.operational_status || motor.status}
                </span>
                <IsoSeverityBadge rms={rms} />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                Health Index
              </span>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: healthScore >= 80 ? 'var(--status-healthy)' : healthScore >= 60 ? 'var(--status-warning)' : 'var(--status-critical)',
                }}
              >
                {healthScore}%
              </span>
            </div>
          </div>

          {/* Real-time Telemetry Snapshot */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              Current Live Telemetry
            </span>
            <div className="grid-cols-3" style={{ marginBottom: 0 }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block' }}>Vibration RMS</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--blue-primary)', fontFamily: 'var(--font-mono)' }}>
                  {rms.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>mm/s</span>
                </span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block' }}>Temperature</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: temp > 70 ? 'var(--status-warning)' : 'var(--status-healthy)', fontFamily: 'var(--font-mono)' }}>
                  {temp.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>°C</span>
                </span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block' }}>Electrical Current</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {curr.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>A</span>
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specifications & Thresholds */}
          <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                Nameplate Specifications
              </span>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-body)' }}>
                <div><strong>Rated Power:</strong> {motor.rated_power_kw} kW</div>
                <div><strong>Supply Voltage:</strong> 415 V (3-Phase)</div>
                <div><strong>Synchronous Speed:</strong> 1480 RPM</div>
                <div><strong>Installation Date:</strong> {motor.installation_date ? new Date(motor.installation_date).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                Configured Safety Limits
              </span>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-body)' }}>
                <div><strong>Vib Warning:</strong> {motor.vibration_warning_threshold} mm/s (Zone C)</div>
                <div><strong>Vib Critical:</strong> {motor.vibration_critical_threshold} mm/s (Zone D)</div>
                <div><strong>Temp Warning:</strong> {motor.temperature_warning_threshold} °C</div>
                <div><strong>Temp Critical:</strong> {motor.temperature_critical_threshold} °C</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {onNavigateLive && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onNavigateLive(motor.id);
              }}
            >
              <Activity size={16} />
              Open Live Stream
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
