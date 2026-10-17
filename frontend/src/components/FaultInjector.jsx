import React, { useState } from 'react';
import { api } from '../services/api';
import { Zap, AlertTriangle, CheckCircle2, Flame, Activity, ShieldAlert } from 'lucide-react';

export function FaultInjector({ selectedMotorId = 1, onFaultTriggered }) {
  const [loading, setLoading] = useState(false);
  const [activeFault, setActiveFault] = useState('NORMAL');
  const [msg, setMsg] = useState('');

  async function triggerFault(faultType) {
    setLoading(true);
    try {
      const res = await api.injectFault(selectedMotorId, faultType);
      setActiveFault(faultType);
      setMsg(res.message);
      if (onFaultTriggered) onFaultTriggered(faultType);
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      setMsg(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--blue-subtle)',
              color: 'var(--blue-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
              Synthetic Sensor Fault Injector (Viva Demonstration Mode)
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>
              Inject simulated physical anomalies into Motor #{selectedMotorId} to demonstrate real-time chart spikes, ISO threshold breaches, and explainable alerts.
            </span>
          </div>
        </div>

        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          Simulated Data Source
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <button
          className={`btn btn-sm ${activeFault === 'NORMAL' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => triggerFault('NORMAL')}
          disabled={loading}
          title="Restore baseline healthy operation"
        >
          <CheckCircle2 size={14} />
          Normal Baseline (ISO Zone A)
        </button>

        <button
          className={`btn btn-sm ${activeFault === 'BEARING_FAULT' ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => triggerFault('BEARING_FAULT')}
          disabled={loading}
          title="Spike RMS vibration above 8.0 mm/s (ISO Zone D)"
        >
          <ShieldAlert size={14} />
          Bearing Fault (Vibration Spike)
        </button>

        <button
          className={`btn btn-sm ${activeFault === 'UNBALANCE' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => triggerFault('UNBALANCE')}
          disabled={loading}
          title="Induce 1X rotational unbalance (ISO Zone C)"
        >
          <Activity size={14} />
          Rotor Unbalance (Warning)
        </button>

        <button
          className={`btn btn-sm ${activeFault === 'THERMAL_OVERLOAD' ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => triggerFault('THERMAL_OVERLOAD')}
          disabled={loading}
          title="Raise motor surface temp to 89.5°C"
        >
          <Flame size={14} />
          Thermal Overload (89.5°C)
        </button>

        <button
          className={`btn btn-sm ${activeFault === 'CURRENT_SURGE' ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => triggerFault('CURRENT_SURGE')}
          disabled={loading}
          title="Simulate high mechanical load surge"
        >
          <Zap size={14} />
          Current Surge (160% Load)
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: 'var(--blue-primary)', fontWeight: 500 }}>
          {msg}
        </div>
      )}
    </div>
  );
}
