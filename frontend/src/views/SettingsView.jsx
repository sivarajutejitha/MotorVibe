import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, CheckCircle2, Database, Radio, Cpu, HelpCircle } from 'lucide-react';

export function SettingsView() {
  const [thresholds, setThresholds] = useState({
    vib_warn_rms: 4.5,
    vib_crit_rms: 7.1,
    temp_warn_c: 70.0,
    temp_crit_c: 85.0,
    curr_warn_a: 14.0,
    curr_crit_a: 18.0,
  });
  const [simulatorStatus, setSimulatorStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [thRes, simRes] = await Promise.all([
          api.getThresholds(),
          api.getSimulatorStatus(),
        ]);
        if (thRes.success && thRes.data.length > 0) {
          const t = thRes.data[0];
          setThresholds({
            vib_warn_rms: t.vib_warn_rms,
            vib_crit_rms: t.vib_crit_rms,
            temp_warn_c: t.temp_warn_c,
            temp_crit_c: t.temp_crit_c,
            curr_warn_a: t.curr_warn_a,
            curr_crit_a: t.curr_crit_a,
          });
        }
        if (simRes.success) setSimulatorStatus(simRes.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    load();
  }, []);

  async function handleSaveThresholds(e) {
    e.preventDefault();
    setLoading(true);
    setSavedMsg('');

    try {
      const res = await api.updateThresholds(thresholds);
      if (res.success) {
        setSavedMsg('Threshold configuration saved to PostgreSQL successfully.');
        setTimeout(() => setSavedMsg(''), 5000);
      }
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSimulator() {
    try {
      const res = await api.toggleSimulator();
      setSimulatorStatus((prev) => ({ ...prev, isRunning: res.isRunning }));
    } catch (err) {
      alert(`Simulator toggle failed: ${err.message}`);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>System Configuration & Alarm Thresholds</h1>
          <p>Configurable ISO 10816 limits, MQTT broker parameters, and PostgreSQL time-series tuning</p>
        </div>
      </div>

      {savedMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-primary)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          {savedMsg}
        </div>
      )}

      <div className="grid-cols-2">
        {/* THRESHOLD CONFIGURATION FORM */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Settings size={18} color="var(--cyan-primary)" />
              Configurable Alarm Limits (ISO 10816-3)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Applied Globally to Fleet
            </span>
          </div>

          <form onSubmit={handleSaveThresholds}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vibration Warning (mm/s)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={thresholds.vib_warn_rms}
                  onChange={(e) => setThresholds({ ...thresholds, vib_warn_rms: parseFloat(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Default: 4.5 mm/s (Zone C)</span>
              </div>

              <div className="form-group">
                <label className="form-label">Vibration Critical (mm/s)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={thresholds.vib_crit_rms}
                  onChange={(e) => setThresholds({ ...thresholds, vib_crit_rms: parseFloat(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Default: 7.1 mm/s (Zone D)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Temperature Warning (°C)</label>
                <input
                  type="number"
                  step="1"
                  className="form-input"
                  value={thresholds.temp_warn_c}
                  onChange={(e) => setThresholds({ ...thresholds, temp_warn_c: parseFloat(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Thermal Warning: 70°C</span>
              </div>

              <div className="form-group">
                <label className="form-label">Temperature Critical (°C)</label>
                <input
                  type="number"
                  step="1"
                  className="form-input"
                  value={thresholds.temp_crit_c}
                  onChange={(e) => setThresholds({ ...thresholds, temp_crit_c: parseFloat(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Class F Insulation Trip: 85°C</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phase Current Warning (A)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={thresholds.curr_warn_a}
                  onChange={(e) => setThresholds({ ...thresholds, curr_warn_a: parseFloat(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>110% Overload: 14.0A</span>
              </div>

              <div className="form-group">
                <label className="form-label">Phase Current Critical (A)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={thresholds.curr_crit_a}
                  onChange={(e) => setThresholds({ ...thresholds, curr_crit_a: parseFloat(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Trip Overcurrent: 18.0A</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Update Alarm Thresholds in PostgreSQL'}
            </button>
          </form>
        </div>

        {/* IIOT PROTOCOLS & ARCHITECTURE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* MQTT Broker Parameters */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Radio size={18} color="var(--emerald-primary)" />
                MQTT IIoT Sensor Gateway Configuration
              </div>
              <span className="badge badge-healthy">QoS Level 1</span>
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Broker URL:</span>
                <code style={{ color: 'var(--cyan-primary)' }}>mqtt://broker.hivemq.com:1883</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Topic Subscription:</span>
                <code style={{ color: 'var(--cyan-primary)' }}>motorvibe/+/telemetry</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Hardware Payload Format:</span>
                <span>JSON (accel X/Y/Z, RMS, temp, current)</span>
              </div>
            </div>
          </div>

          {/* Simulator Controls */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Cpu size={18} color="var(--cyan-primary)" />
                Industrial Telemetry Generator (Demo Mode)
              </div>
              <span className={`badge ${simulatorStatus?.isRunning ? 'badge-healthy' : 'badge-warning'}`}>
                {simulatorStatus?.isRunning ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Generates realistic 3-axis sinusoidal vibration data with Gaussian white noise and computes true RMS velocity every 1000ms.
            </p>
            <button
              className={`btn btn-sm ${simulatorStatus?.isRunning ? 'btn-outline' : 'btn-emerald'}`}
              onClick={handleToggleSimulator}
            >
              {simulatorStatus?.isRunning ? 'Pause Background Simulator' : 'Start Background Simulator'}
            </button>
          </div>

          {/* TimescaleDB Architecture Note */}
          <div className="card" style={{ borderLeft: '3px solid var(--emerald-primary)' }}>
            <div className="card-header">
              <div className="card-title">
                <Database size={18} color="var(--emerald-primary)" />
                PostgreSQL & TimescaleDB Scalability
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>CO-6 Viva Topic</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              MotorVibe uses standard PostgreSQL with connection pooling and B-tree indexes on <code>(machine_id, recorded_at DESC)</code>. In enterprise production, PostgreSQL can be upgraded seamlessly with the <strong>TimescaleDB extension</strong> to convert <code>sensor_readings</code> into a chunked hypertable for multi-million sample analytical rollups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
