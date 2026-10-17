import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Building, 
  Mail, 
  Shield, 
  Radio, 
  Cpu, 
  Sliders, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Activity,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // System & Telemetry status
  const [simStatus, setSimStatus] = useState(null);
  const [mqttStatus, setMqttStatus] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [thresholds, setThresholds] = useState([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setOrganization(user.organization || '');
    }
  }, [user]);

  async function loadSystemStatus() {
    try {
      const [simRes, threshRes] = await Promise.all([
        api.getSimulatorStatus(),
        api.getThresholds(),
      ]);

      if (simRes.success) setSimStatus(simRes.data);
      if (threshRes.success) {
        setThresholds(threshRes.data || []);
        setMqttStatus(threshRes.mqtt);
      }
    } catch (err) {
      console.error('Failed to load system settings status:', err);
    }
  }

  useEffect(() => {
    loadSystemStatus();
  }, []);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await api.updateProfile({
        full_name: fullName,
        organization,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg('User profile updated successfully in PostgreSQL.');
        setTimeout(() => setProfileMsg(''), 4000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleToggleSimulator() {
    setSimLoading(true);
    try {
      const res = await api.toggleSimulator();
      if (res.success) {
        await loadSystemStatus();
      }
    } catch (err) {
      alert(`Simulator toggle failed: ${err.message}`);
    } finally {
      setSimLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          System & Plant Configuration Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Manage user credentials, telemetry broker connectivity, and simulation status
        </p>
      </div>

      <div className="grid-cols-2">
        {/* 1. USER PROFILE SECTION */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <User size={18} color="var(--blue-primary)" />
              User Profile & Factory Allocation
            </div>
          </div>

          {profileMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--status-healthy-bg)',
                border: '1px solid var(--status-healthy-border)',
                color: 'var(--status-healthy)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle2 size={16} />
              {profileMsg}
            </div>
          )}

          {profileError && (
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
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-Only)</label>
              <input
                type="email"
                className="form-control"
                style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-light)', cursor: 'not-allowed' }}
                value={user?.email || ''}
                disabled
              />
              <span className="form-helper">Email is your unique database authentication key</span>
            </div>

            <div className="form-group">
              <label className="form-label">Organization / Plant Facility</label>
              <input
                type="text"
                className="form-control"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Manufacturing Plant"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <input
                type="text"
                className="form-control"
                style={{ backgroundColor: 'var(--bg-subtle)', textTransform: 'capitalize' }}
                value={user?.role || 'Engineer'}
                disabled
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Saving in PostgreSQL...' : 'Update Profile'}
              </button>

              <button type="button" className="btn btn-outline" onClick={handleLogout} style={{ color: 'var(--status-critical)' }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </form>
        </div>

        {/* 2. TELEMETRY ENGINE & BROKER STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sensor Simulator Status */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Activity size={18} color="var(--blue-primary)" />
                Synthetic Sensor Simulation Engine
              </div>
              <span className={`badge ${simStatus?.isRunning ? 'badge-healthy' : 'badge-offline'}`}>
                {simStatus?.isRunning ? 'Running (1Hz)' : 'Paused'}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '1rem' }}>
              The high-fidelity physics simulator emits synthetic 3-axis vibration, IR temperature, and electrical phase current for demonstration without physical sensors or MQTT hardware attached.
            </p>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
              <div><strong>Emission Rate:</strong> 1 snapshot per second (1000ms)</div>
              <div><strong>Sampling & Storage:</strong> Sampled every 10s into PostgreSQL <code>sensor_readings</code></div>
              <div><strong>Monitored Motor Count:</strong> 6 Industrial induction units</div>
            </div>

            <button
              className={`btn btn-sm ${simStatus?.isRunning ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleToggleSimulator}
              disabled={simLoading}
            >
              {simLoading ? 'Updating Engine...' : simStatus?.isRunning ? 'Pause Simulator' : 'Resume Simulator'}
            </button>
          </div>

          {/* MQTT Broker Status */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Radio size={18} color="var(--status-info)" />
                MQTT IIoT Broker Integration
              </div>
              <span className={`badge ${mqttStatus?.connected ? 'badge-healthy' : 'badge-warning'}`}>
                {mqttStatus?.connected ? 'Connected' : 'Broker Disconnected / Fallback'}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              MotorVibe subscribes to industrial telemetry messages published over standard MQTT brokers.
            </p>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-muted)' }}>
              <div><strong>Broker URL:</strong> <code>{mqttStatus?.broker_url || 'mqtt://broker.hivemq.com:1883'}</code></div>
              <div><strong>Topic Pattern:</strong> <code>{mqttStatus?.topic || 'motorvibe/+/telemetry'}</code></div>
              <div><strong>Hardware Bridge:</strong> Active (ESP32 + MPU6050 compatible)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SAFETY THRESHOLDS SUMMARY TABLE */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sliders size={18} color="var(--blue-primary)" />
            Motor Safety Threshold Guidelines (ISO 10816-3 Standards)
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Motor Code</th>
                <th>Motor Name</th>
                <th>Vibration Warning (Zone C)</th>
                <th>Vibration Critical (Zone D)</th>
                <th>Thermal Warning Limit</th>
                <th>Thermal Critical Limit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((t) => (
                <tr key={t.motor_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--blue-primary)' }}>
                    {t.equipment_code}
                  </td>
                  <td style={{ fontWeight: 600 }}>{t.motor_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <span className="badge badge-warning">{t.vibration_warning_threshold} mm/s</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <span className="badge badge-critical">{t.vibration_critical_threshold} mm/s</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.temperature_warning_threshold} °C</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.temperature_critical_threshold} °C</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate('/motors')}
                      title="Adjust in Motors Management"
                    >
                      Configure Limits
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
