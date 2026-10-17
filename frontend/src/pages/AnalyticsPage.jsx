import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Activity,
  Flame,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Wrench,
  Layers,
} from 'lucide-react';

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  Warning: '#d97706',
  Info: '#0284c7',
};

const HEALTH_COLORS = {
  Healthy: '#16a34a',
  Warning: '#d97706',
  Critical: '#dc2626',
  Offline: '#94a3b8',
};

export function AnalyticsPage() {
  const [range, setRange] = useState('24h');
  const [motors, setMotors] = useState([]);
  const [selectedMotorId, setSelectedMotorId] = useState('');
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const [mRes, overRes, trRes] = await Promise.all([
        api.getMotors(),
        api.getAnalyticsOverview(),
        api.getAnalyticsTrends({ motor_id: selectedMotorId, range }),
      ]);

      if (mRes.success) setMotors(mRes.data);
      if (overRes.success) setOverview(overRes.data);
      if (trRes.success) setTrends(trRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [selectedMotorId, range]);

  // Format trend data for Recharts
  const formattedTrends = trends.map((t) => ({
    time: new Date(t.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    vibration_rms: Number(t.vibration_rms || t.vib_rms || 0),
    temperature: Number(t.temperature_c || t.temperature || 0),
    current: Number(t.current_a || t.current || 0),
  }));

  // Format motor comparison data for Bar Chart
  const motorComparison = overview?.motor_comparison?.map((m) => ({
    code: m.equipment_code,
    name: m.motor_name,
    runtime: Number(m.runtime_hours || 0),
    avg_vibration: Number(m.avg_vibration || 2.2),
    avg_temperature: Number(m.avg_temperature || 52.0),
    avg_current: Number(m.avg_current || 9.0),
  })) || [];

  // Health distribution data for Pie Chart
  const healthDist = overview?.health_distribution?.map((h) => ({
    name: h.operational_status,
    value: parseInt(h.count, 10),
  })) || [
    { name: 'Healthy', value: 3 },
    { name: 'Warning', value: 2 },
    { name: 'Critical', value: 1 },
  ];

  // Alert severity data for Bar Chart
  const alertSeverity = overview?.alert_severity?.map((a) => ({
    severity: a.severity,
    count: parseInt(a.count, 10),
  })) || [];

  // Maintenance summary for Bar Chart
  const maintSummary = overview?.maintenance_summary?.map((m) => ({
    type: m.maintenance_type,
    count: parseInt(m.count, 10),
  })) || [];

  return (
    <div>
      {/* Header and Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Fleet Telemetry & Operational Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Historical trends, comparative runtime diagnostics, and predictive reliability metrics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Motor Selector */}
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedMotorId}
            onChange={(e) => setSelectedMotorId(e.target.value)}
          >
            <option value="">All Monitored Motors</option>
            {motors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.equipment_code || m.machine_code} - {m.motor_name || m.name}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.2rem' }}>
            <button
              className={`btn btn-sm ${range === '1h' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setRange('1h')}
            >
              1 Hour
            </button>
            <button
              className={`btn btn-sm ${range === '24h' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setRange('24h')}
            >
              24 Hours
            </button>
            <button
              className={`btn btn-sm ${range === '7d' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setRange('7d')}
            >
              7 Days
            </button>
          </div>

          <button className="btn btn-outline btn-sm" onClick={loadAnalytics} title="Refresh Analytics">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 1. TIME-SERIES TRENDS: VIBRATION, TEMPERATURE, CURRENT */}
      <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        {/* Vibration Trend Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="var(--blue-primary)" />
              Vibration Velocity RMS Trends (ISO 10816-3)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
              Limit: 4.5 / 7.1 mm/s
            </span>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 9]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="vibration_rms"
                  name="Vibration RMS (mm/s)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Trend Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Flame size={18} color="var(--status-warning)" />
              Motor Temperature Trends
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
              Limit: 70°C / 85°C
            </span>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[30, 95]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. CURRENT CONSUMPTION & RUNTIME COMPARISON */}
      <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        {/* Electrical Current Area Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Zap size={18} color="var(--status-healthy)" />
              Electrical Current Consumption (Amperes)
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Phase Current (A)"
                  stroke="#16a34a"
                  fill="#dcfce7"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motor Runtime Comparison Bar Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} color="var(--blue-primary)" />
              Motor Runtime Comparison (Cumulative Hours)
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={motorComparison} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="runtime" name="Runtime (Hours)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. HEALTH DISTRIBUTION & ALERTS BREAKDOWN */}
      <div className="grid-cols-3">
        {/* Health Distribution Donut */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} color="var(--status-healthy)" />
              Motor Health Distribution
            </div>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthDist.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={HEALTH_COLORS[entry.name] || '#2563eb'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Counts by Severity */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="var(--status-warning)" />
              Alert Counts by Severity
            </div>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertSeverity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="severity" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" name="Count" fill="#d97706" radius={[4, 4, 0, 0]}>
                  {alertSeverity.map((entry) => (
                    <Cell key={`sev-${entry.severity}`} fill={SEVERITY_COLORS[entry.severity] || '#d97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance History Summary */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Wrench size={18} color="var(--blue-primary)" />
              Maintenance Classifications
            </div>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintSummary} layout="vertical" margin={{ top: 10, right: 15, left: 35, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="type" type="category" stroke="#64748b" fontSize={9} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" name="Logs" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
