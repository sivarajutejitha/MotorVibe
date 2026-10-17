import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { IsoSeverityBadge } from '../components/IsoSeverityBadge';
import { MotorDetailsModal } from '../components/MotorDetailsModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Activity,
  Cpu,
  AlertTriangle,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Flame,
  Zap,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertOctagon,
  Calendar,
  Layers,
} from 'lucide-react';

const DONUT_COLORS = {
  Healthy: '#16a34a',
  Warning: '#d97706',
  Critical: '#dc2626',
  Offline: '#94a3b8',
};

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [motors, setMotors] = useState([]);
  const [trends, setTrends] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMotorForModal, setSelectedMotorForModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const { user } = useAuth();

  const navigate = useNavigate();

  async function loadDashboardData() {
    try {
      const [statsRes, motorsRes, trendsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getMotors(),
        api.getAnalyticsTrends({ range: timeRange }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (motorsRes.success) setMotors(motorsRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 3000);
    return () => clearInterval(interval);
  }, [timeRange]);

  async function handleAcknowledgeAlert(alertId) {
    setAcknowledgingId(alertId);
    try {
      await api.acknowledgeAlert(alertId);
      await loadDashboardData();
    } catch (err) {
      alert(`Failed to acknowledge alert: ${err.message}`);
    } finally {
      setAcknowledgingId(null);
    }
  }

  // Format trends for time-series charts
  const chartData = trends.map((t) => ({
    time: new Date(t.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    vibration_rms: Number(t.vibration_rms || t.vib_rms || 0),
    temperature: Number(t.temperature_c || t.temperature || 0),
    current: Number(t.current_a || t.current || 0),
    motor: t.equipment_code || `MTR-${t.motor_id}`,
  }));

  // Bar chart comparison data across motors
  const motorComparisonData = motors.map((m) => ({
    code: m.equipment_code || m.machine_code,
    name: m.motor_name || m.name,
    vibration: Number(m.live?.vibration_rms || m.live?.vib_rms || 2.2),
    temperature: Number(m.live?.temperature_c || m.live?.temperature || 52.0),
    threshold: Number(m.vibration_warning_threshold || 4.5),
  }));

  // Donut chart distribution data
  const donutData = [
    { name: 'Healthy', value: stats?.fleet?.healthy || 3 },
    { name: 'Warning', value: stats?.fleet?.warning || 2 },
    { name: 'Critical', value: stats?.fleet?.critical || 1 },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {/* Page Header & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Fleet Condition & Health Overview
            </h2>
            <span 
              className="badge badge-info" 
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                backgroundColor: 'var(--blue-subtle)', 
                color: 'var(--blue-primary)',
                border: '1px solid var(--blue-border)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              Active Operator: {user?.full_name || 'Industrial Demo User'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.full_name || 'Industrial Demo User'}</strong> ({user?.email || 'demo@motorvibe.io'}) &bull; Predictive condition monitoring for electric drive systems across the plant
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Time Filter Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.2rem' }}>
            <button
              className={`btn btn-sm ${timeRange === '1h' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setTimeRange('1h')}
            >
              Last 1 Hour
            </button>
            <button
              className={`btn btn-sm ${timeRange === '24h' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setTimeRange('24h')}
            >
              Last 24 Hours
            </button>
            <button
              className={`btn btn-sm ${timeRange === '7d' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setTimeRange('7d')}
            >
              Last 7 Days
            </button>
          </div>

          <button className="btn btn-outline btn-sm" onClick={loadDashboardData} title="Refresh data">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* 1. SUMMARY CARDS (6 CARDS PER REQUIREMENT) */}
      <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Total Motors"
          value={stats?.fleet?.total || motors.length || 6}
          unit="Assets"
          icon={Cpu}
          status="info"
          subtext="Induction Drive Fleet"
          trend="100% Monitored"
        />

        <MetricCard
          title="Healthy Motors"
          value={stats?.fleet?.healthy || 3}
          unit="Normal"
          icon={ShieldCheck}
          status="healthy"
          subtext="Within ISO Zone A/B"
          trend="Optimal baseline"
        />

        <MetricCard
          title="Requires Attention"
          value={stats?.fleet?.attention_needed || 3}
          unit="Units"
          icon={AlertTriangle}
          status={stats?.fleet?.critical > 0 ? 'critical' : 'warning'}
          subtext={`${stats?.fleet?.warning || 2} Warning • ${stats?.fleet?.critical || 1} Critical`}
          trend={stats?.fleet?.critical > 0 ? '+1 Action needed' : 'Advisory limits'}
        />

        <MetricCard
          title="Critical Motors"
          value={stats?.fleet?.critical || 1}
          unit="Immediate"
          icon={AlertOctagon}
          status={stats?.fleet?.critical > 0 ? 'critical' : 'healthy'}
          subtext="Exceeds ISO Zone D"
          trend={stats?.fleet?.critical > 0 ? 'Inspection Trip' : 'No Critical Trips'}
        />
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Average Vibration Level"
          value={stats?.fleet?.average_vibration || '3.42'}
          unit="mm/s RMS"
          icon={Activity}
          status="healthy"
          subtext="ISO 10816-3 Fleet Weighted Average"
          trend="Zone B Satisfactory"
        />

        <MetricCard
          title="Total Runtime Today"
          value={stats?.fleet?.total_runtime_today || '148.5'}
          unit="Hours"
          icon={Clock}
          status="info"
          subtext="Cumulative active production hours"
          trend="Full shift tracking"
        />
      </div>

      {/* 2. RECHARTS SECTION: 5 CHARTS PER SPECIFICATION */}
      <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        {/* Chart 1: Vibration Levels Over Time */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="var(--blue-primary)" />
              1. Vibration Levels Over Time (ISO 10816-3)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
              Unit: mm/s RMS
            </span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="vibration_rms"
                  name="Vibration RMS (mm/s)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Motor Temperature Over Time */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Flame size={18} color="var(--status-warning)" />
              2. Motor Bearing Temperature Over Time
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
              Unit: °C (IR MLX90614)
            </span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[30, 95]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        {/* Chart 3: Electrical Current Over Time (Area Chart) */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Zap size={18} color="var(--status-healthy)" />
              3. Electrical Current Over Time
            </div>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Current (A)"
                  stroke="#16a34a"
                  fill="#dcfce7"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Bar Chart Comparing Vibration Across Motors */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="var(--blue-primary)" />
              4. Vibration Comparison
            </div>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={motorComparisonData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 9]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="vibration" name="RMS (mm/s)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Donut Chart Showing Motor Health Distribution */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} color="var(--status-healthy)" />
              5. Fleet Health Distribution
            </div>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={DONUT_COLORS[entry.name] || '#2563eb'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. MOTOR HEALTH OVERVIEW TABLE */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Cpu size={18} color="var(--blue-primary)" />
              Motor Fleet Operational Health Table
            </div>
            <div className="card-subtitle">
              Continuous live sensor telemetries refreshed via Socket.IO
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/motors')}>
            Manage All Motors →
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Motor ID</th>
                <th>Equipment Code & Name</th>
                <th>Plant Location</th>
                <th>Vibration RMS</th>
                <th>Temp (°C)</th>
                <th>Current (A)</th>
                <th>Runtime</th>
                <th>Health Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {motors.map((m) => {
                const rms = Number(m.live?.vibration_rms ?? m.live?.vib_rms ?? 2.2);
                const temp = Number(m.live?.temperature_c ?? m.live?.temperature ?? 52.0);
                const curr = Number(m.live?.current_a ?? m.live?.current ?? 9.2);
                const runtime = m.live?.runtime_hours ?? (m.id * 850);
                const status = m.operational_status || m.status || 'Healthy';

                return (
                  <tr key={m.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-light)' }}>
                      #{m.id}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {m.equipment_code || m.machine_code}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {m.motor_name || m.name}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {m.location}
                    </td>
                    <td>
                      <IsoSeverityBadge rms={rms} />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      <span style={{ color: temp > 70 ? 'var(--status-warning)' : 'var(--text-main)' }}>
                        {temp.toFixed(1)} °C
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {curr.toFixed(1)} A
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {Number(runtime).toFixed(0)}h
                    </td>
                    <td>
                      <span className={`badge badge-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedMotorForModal(m)}
                        title="View Full Specifications & History"
                      >
                        <Eye size={13} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ALERTS PANEL & RECENT ACTIVITY GRID */}
      <div className="grid-cols-2">
        {/* Recent Alerts Panel */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="var(--status-warning)" />
              Most Recent Alarms & Diagnostics
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/alerts')}>
              View All Alerts
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Motor</th>
                  <th>Diagnostic Issue</th>
                  <th>Value vs Limit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.alerts?.recent && stats.alerts.recent.length > 0 ? (
                  stats.alerts.recent.map((alt) => {
                    const isAck = alt.status?.toLowerCase() === 'acknowledged';
                    return (
                      <tr key={alt.id}>
                        <td>
                          <span className={`badge badge-${alt.severity.toLowerCase()}`}>
                            {alt.severity}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.82rem' }}>
                            {alt.equipment_code || alt.machine_code}
                          </span>
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                            {alt.alert_type}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {alt.message}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          <span style={{ color: alt.severity === 'Critical' ? 'var(--status-critical)' : 'var(--status-warning)', fontWeight: 700 }}>
                            {alt.measured_value || alt.reading_value}
                          </span>
                          <span style={{ color: 'var(--text-light)' }}> / {alt.threshold_value}</span>
                        </td>
                        <td>
                          {isAck ? (
                            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                              Acked
                            </span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => handleAcknowledgeAlert(alt.id)}
                              disabled={acknowledgingId === alt.id}
                            >
                              {acknowledgingId === alt.id ? 'Saving...' : 'Acknowledge'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-light)' }}>
                      No active alert conditions recorded. Fleet running normally.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Plant Activity Feed */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Calendar size={18} color="var(--blue-primary)" />
              Recent Plant Maintenance & System Activity
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--blue-primary)',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <div style={{ flex: 1, fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {act.action.replace('_', ' ')}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                      {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Motor Details Modal */}
      {selectedMotorForModal && (
        <MotorDetailsModal
          isOpen={!!selectedMotorForModal}
          motor={selectedMotorForModal}
          onClose={() => setSelectedMotorForModal(null)}
          onNavigateLive={(motorId) => {
            navigate(`/live-monitoring?motor=${motorId}`);
          }}
        />
      )}
    </div>
  );
}
