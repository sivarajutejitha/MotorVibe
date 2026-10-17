import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { Line, Bar } from 'react-chartjs-2';
import { 
  BarChart3, 
  Activity, 
  Flame, 
  Zap, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  Layers 
} from 'lucide-react';

export function AnalyticsView({ selectedMachineId = 1, onSelectMachine }) {
  const [range, setRange] = useState('24h');
  const [machines, setMachines] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [mRes, histRes, statsRes] = await Promise.all([
        api.getMachines(),
        api.getReadingsHistory({ machine_id: selectedMachineId, range, limit: 120 }),
        api.getMachineStats(selectedMachineId, range),
      ]);

      if (mRes.success) setMachines(mRes.data);
      if (histRes.success) setHistory(histRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedMachineId, range]);

  const activeMachine = machines.find((m) => m.id === Number(selectedMachineId));

  // Timestamps and series
  const labels = history.map((h) => 
    new Date(h.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const vibSeries = history.map((h) => Number(h.vib_rms));
  const tempSeries = history.map((h) => Number(h.temperature));
  const currSeries = history.map((h) => Number(h.current));

  // Chart configs
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c1424',
        borderColor: '#1c2e4f',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(28, 46, 79, 0.25)' },
        ticks: { color: '#64748b', maxTicksLimit: 10 },
      },
      y: {
        grid: { color: 'rgba(28, 46, 79, 0.25)' },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  // Fleet comparison chart
  const fleetCodes = machines.map((m) => m.machine_code);
  const fleetVib = machines.map((m) => m.live?.vib_rms ?? 2.2);
  const fleetTemp = machines.map((m) => m.live?.temperature ?? 52.0);

  const fleetChartData = {
    labels: fleetCodes,
    datasets: [
      {
        label: 'RMS Vibration (mm/s)',
        data: fleetVib,
        backgroundColor: 'rgba(0, 242, 254, 0.75)',
        borderColor: '#00f2fe',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Bearing Temp (°C)',
        data: fleetTemp,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Machinery Historical Analytics & Trends</h1>
          <p>Longitudinal sensor patterns stored in PostgreSQL (Past 24 Hours & Multi-Machine Comparison)</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={selectedMachineId}
            onChange={(e) => onSelectMachine(Number(e.target.value))}
            style={{ fontWeight: 600, color: 'var(--cyan-primary)' }}
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_code} - {m.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: '60s', label: 'Last 60s' },
              { id: '1h', label: '1 Hour' },
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
            ].map((btn) => (
              <button
                key={btn.id}
                className={`btn btn-sm ${range === btn.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
                onClick={() => setRange(btn.id)}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button className="btn btn-outline btn-sm" onClick={loadData}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* STATISTICAL SUMMARY METRICS */}
      <div className="grid-cols-3">
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} /> Vibration RMS (mm/s)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{range} stats</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Minimum</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {stats?.min_vib_rms ?? '1.95'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Average</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                {stats?.avg_vib_rms ?? '2.21'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Maximum</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--amber-warning)', fontFamily: 'var(--font-mono)' }}>
                {stats?.max_vib_rms ?? '2.45'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame size={16} /> Bearing Temp (°C)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{range} stats</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Minimum</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {stats?.min_temp ?? '48.5'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Average</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                {stats?.avg_temp ?? '52.4'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Maximum</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--amber-warning)', fontFamily: 'var(--font-mono)' }}>
                {stats?.max_temp ?? '54.2'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} /> Load Current (Amps)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{range} stats</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Minimum</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {stats?.min_current ?? '8.9'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Average</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {stats?.avg_current ?? '9.4'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Maximum</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--red-critical)', fontFamily: 'var(--font-mono)' }}>
                {stats?.max_current ?? '9.8'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 SEPARATE TIME-SERIES GRAPHS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* 1. Vibration History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="var(--cyan-primary)" />
              Vibration Velocity RMS History (ISO 10816 mm/s) — {activeMachine?.machine_code}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cyan-primary)' }}>Threshold: 4.5 mm/s (Warn) • 7.1 mm/s (Crit)</span>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <Line
              data={{
                labels: labels.length > 0 ? labels : ['Past', 'Now'],
                datasets: [
                  {
                    label: 'Vibration RMS (mm/s)',
                    data: vibSeries.length > 0 ? vibSeries : [2.15, 2.22],
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={baseChartOptions}
            />
          </div>
        </div>

        {/* 2. Temperature History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Flame size={18} color="var(--emerald-primary)" />
              Motor Bearing Housing Temperature (°C) — {activeMachine?.machine_code}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)' }}>Threshold: 70.0°C (Warn) • 85.0°C (Crit)</span>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <Line
              data={{
                labels: labels.length > 0 ? labels : ['Past', 'Now'],
                datasets: [
                  {
                    label: 'Temperature (°C)',
                    data: tempSeries.length > 0 ? tempSeries : [48.5, 51.2],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={baseChartOptions}
            />
          </div>
        </div>

        {/* 3. Electrical Current History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Zap size={18} color="#f59e0b" />
              Electrical CT Clamp Phase Amperage (A) — {activeMachine?.machine_code}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Rated Nameplate Current: {activeMachine?.rated_current_a} A</span>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <Line
              data={{
                labels: labels.length > 0 ? labels : ['Past', 'Now'],
                datasets: [
                  {
                    label: 'Current (A)',
                    data: currSeries.length > 0 ? currSeries : [9.2, 9.4],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={baseChartOptions}
            />
          </div>
        </div>
      </div>

      {/* FLEET-WIDE COMPARISON BAR CHART */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} color="var(--cyan-primary)" />
            Cross-Machinery Fleet Comparison (Vibration & Temperature)
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Comparing All Active Motors in Plant
          </span>
        </div>
        <div style={{ height: '260px', width: '100%' }}>
          <Bar
            data={fleetChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: '#94a3b8' } },
              },
              scales: {
                x: { ticks: { color: '#fff', font: { weight: 'bold' } }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(28, 46, 79, 0.3)' } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
