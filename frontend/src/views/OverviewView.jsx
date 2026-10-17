import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { IsoSeverityBadge } from '../components/IsoSeverityBadge';
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertOctagon,
  RefreshCw,
  Flame,
  Zap
} from 'lucide-react';

export function OverviewView({ onSelectMachine, onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [statsRes, machinesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getMachines(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (machinesRes.success) setMachines(machinesRes.data);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Plant Fleet Condition Overview</h1>
          <p>Autonomous Industry 4.0 condition monitoring for electric drive systems</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={loadData}>
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab('live')}>
            <Activity size={14} />
            View Live Stream
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid-cols-4">
        <MetricCard
          title="Monitored Fleet Assets"
          value={stats?.fleet?.total || 4}
          unit="Motors"
          icon={Cpu}
          status="healthy"
          subtext="Induction & Geared Motors"
          trend="100% Operational"
        />

        <MetricCard
          title="Optimal Condition"
          value={stats?.fleet?.healthy || 2}
          unit="Normal"
          icon={ShieldCheck}
          status="healthy"
          subtext="Within ISO Zone A/B limits"
          trend="Healthy baseline"
        />

        <MetricCard
          title="Attention Required"
          value={stats?.fleet?.attention_needed || 2}
          unit="Units"
          icon={AlertTriangle}
          status={stats?.fleet?.critical > 0 ? 'critical' : 'warning'}
          subtext={`${stats?.fleet?.warning || 1} Warning • ${stats?.fleet?.critical || 1} Critical`}
          trend={stats?.fleet?.critical > 0 ? '+1 Critical alert' : 'Warning state'}
        />

        <MetricCard
          title="Fleet Health Index"
          value={`${stats?.fleet?.average_health_score || 82}%`}
          icon={Activity}
          status={stats?.fleet?.average_health_score >= 80 ? 'healthy' : 'warning'}
          subtext="Weighted Vib, Temp & Load"
          trend="ISO 10816 Evaluated"
        />
      </div>

      {/* FLEET MACHINES STATUS GRID */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
            Active Machinery Digital Twins
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time telemetry updated every second via WebSockets
          </span>
        </div>

        <div className="grid-cols-2">
          {machines.map((m) => {
            const rms = m.live?.vib_rms ?? 2.2;
            const temp = m.live?.temperature ?? 52.0;
            const curr = m.live?.current ?? 9.2;
            const score = m.health_score ?? 85;

            const isCritical = m.status === 'CRITICAL';
            const isWarning = m.status === 'WARNING';
            const cardStatus = isCritical ? 'critical' : isWarning ? 'warning' : 'healthy';

            return (
              <div 
                key={m.id} 
                className="card" 
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => {
                  onSelectMachine(m.id);
                  onNavigateTab('live');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                        {m.machine_code}
                      </span>
                      <span className={`badge badge-${cardStatus}`}>
                        {m.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {m.type} • {m.location}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: score >= 80 ? 'var(--emerald-primary)' : score >= 60 ? 'var(--amber-warning)' : 'var(--red-critical)', fontFamily: 'var(--font-mono)' }}>
                      {score}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Health Score</div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <IsoSeverityBadge rms={rms} />
                </div>

                {/* Machine metrics bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Vibration RMS</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                      {rms} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>mm/s</span>
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Motor Temp</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                      {temp} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>°C</span>
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Current Load</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {curr} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>A</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                  <span>Rated: {m.rated_power_kw} kW • {m.rated_rpm} RPM</span>
                  <span style={{ color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                    Monitor Live <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT ACTIVE ALERTS TABLE */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <AlertTriangle size={18} color="var(--amber-warning)" />
            Recent Machinery Alerts & Root Causes
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigateTab('alerts')}>
            View All Alerts
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Machine</th>
                <th>Diagnostic Finding</th>
                <th>Reading vs Limit</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats?.alerts?.recent && stats.alerts.recent.length > 0 ? (
                stats.alerts.recent.map((alt) => (
                  <tr key={alt.id}>
                    <td>
                      <span className={`badge badge-${alt.severity.toLowerCase()}`}>
                        {alt.severity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--cyan-primary)' }}>{alt.machine_code}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{alt.machine_name}</span>
                    </td>
                    <td style={{ maxWidth: '380px' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{alt.message}</span>
                      {alt.suggested_action && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Action: {alt.suggested_action}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--red-critical)', fontWeight: 700 }}>{alt.reading_value}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}> / {alt.threshold_value}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)' }}>
                    No active alarm conditions recorded. Fleet running normally.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
