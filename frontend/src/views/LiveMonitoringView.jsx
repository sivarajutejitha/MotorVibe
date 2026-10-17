import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSensorData } from '../hooks/useSensorData';
import { FaultInjector } from '../components/FaultInjector';
import { IsoSeverityBadge } from '../components/IsoSeverityBadge';
import { MetricCard } from '../components/MetricCard';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import { 
  Activity, 
  Flame, 
  Zap, 
  Clock, 
  Radio, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart2, 
  Layers 
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function LiveMonitoringView({ selectedMachineId = 1, onSelectMachine }) {
  const [machines, setMachines] = useState([]);
  const [activeMachine, setActiveMachine] = useState(null);
  const [runtimeSeconds, setRuntimeSeconds] = useState(14820); // Simulated runtime in seconds

  const { isConnected, currentReading, history60s } = useSensorData(selectedMachineId);

  // Runtime clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRuntimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load machines list
  useEffect(() => {
    async function load() {
      try {
        const res = await api.getMachines();
        if (res.success) {
          setMachines(res.data);
          const found = res.data.find((m) => m.id === Number(selectedMachineId));
          setActiveMachine(found || res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load machines:', err);
      }
    }
    load();
  }, [selectedMachineId]);

  // Safe fallback readings
  const rms = currentReading?.vib_rms ?? 2.21;
  const vibX = currentReading?.vib_x ?? 0.45;
  const vibY = currentReading?.vib_y ?? 0.52;
  const vibZ = currentReading?.vib_z ?? 0.38;
  const temp = currentReading?.temperature ?? 52.4;
  const current = currentReading?.current ?? 9.4;
  const freq = currentReading?.frequency_peak ?? 50.0;
  const isSimulated = currentReading?.is_simulated ?? true;
  const healthScore = currentReading?.health?.overall ?? 88;

  // Format runtime
  const hours = Math.floor(runtimeSeconds / 3600);
  const minutes = Math.floor((runtimeSeconds % 3600) / 60);
  const seconds = runtimeSeconds % 60;
  const runtimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

  // 1. Chart Configuration: Rolling 60-Second Real-Time Multi-Metric Stream
  const timeLabels = history60s.map((d) => d.time);
  const rmsData = history60s.map((d) => d.vib_rms);
  const tempData = history60s.map((d) => d.temperature);
  const currData = history60s.map((d) => d.current);

  const rollingChartData = {
    labels: timeLabels.length > 0 ? timeLabels : ['Now'],
    datasets: [
      {
        label: 'Vibration RMS (mm/s)',
        data: rmsData.length > 0 ? rmsData : [rms],
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        yAxisID: 'yVib',
      },
      {
        label: 'Motor Temp (°C)',
        data: tempData.length > 0 ? tempData : [temp],
        borderColor: '#10b981',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'yTemp',
      },
      {
        label: 'Electrical Current (A)',
        data: currData.length > 0 ? currData : [current],
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.3,
        yAxisID: 'yTemp',
      },
    ],
  };

  const rollingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Smooth 1-second streaming without sluggish animations
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#0c1424',
        borderColor: '#1c2e4f',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(28, 46, 79, 0.3)' },
        ticks: { color: '#64748b', maxTicksLimit: 8 },
      },
      yVib: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Vibration RMS (mm/s)', color: '#00f2fe', font: { size: 10 } },
        grid: { color: 'rgba(28, 46, 79, 0.3)' },
        ticks: { color: '#00f2fe' },
        suggestedMin: 0,
        suggestedMax: 10,
      },
      yTemp: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Temp (°C) / Current (A)', color: '#10b981', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8' },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  // 2. Chart Configuration: FFT Frequency Spectrum (5Hz to 120Hz Harmonics)
  const spectrumBins = currentReading?.spectrum || [];
  const fftLabels = spectrumBins.map((b) => `${b.frequency}Hz`);
  const fftAmplitudes = spectrumBins.map((b) => b.amplitude);

  const fftChartData = {
    labels: fftLabels.length > 0 ? fftLabels : ['25Hz', '50Hz (1X)', '75Hz', '100Hz (2X)'],
    datasets: [
      {
        label: 'Harmonic Velocity Amplitude (mm/s)',
        data: fftAmplitudes.length > 0 ? fftAmplitudes : [0.4, 2.1, 0.5, 0.9],
        backgroundColor: (context) => {
          const val = context.raw || 0;
          return val > 3.0 ? 'rgba(239, 68, 68, 0.75)' : val > 1.8 ? 'rgba(0, 242, 254, 0.85)' : 'rgba(6, 182, 212, 0.35)';
        },
        borderColor: '#00f2fe',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const fftChartOptions = {
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
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45 },
      },
      y: {
        grid: { color: 'rgba(28, 46, 79, 0.3)' },
        ticks: { color: '#94a3b8' },
        suggestedMin: 0,
        suggestedMax: 5,
      },
    },
  };

  // 3. 3-Axis Vibration Acceleration Chart (X, Y, Z)
  const axisChartData = {
    labels: ['X-Axis (Radial Horiz)', 'Y-Axis (Radial Vert)', 'Z-Axis (Axial Thrust)'],
    datasets: [
      {
        label: 'Peak Acceleration (g)',
        data: [vibX, vibY, vibZ],
        backgroundColor: ['rgba(0, 242, 254, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)'],
        borderColor: ['#00f2fe', '#10b981', '#f59e0b'],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div>
      {/* HEADER & MACHINE SELECTOR */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Live Sensor Telemetry & Spectrum</h1>
            <span className={`badge ${isSimulated ? 'badge-demo' : 'badge-healthy'}`}>
              {isSimulated ? 'DEMO DATA (SIMULATED)' : 'MQTT HARDWARE LIVE'}
            </span>
          </div>
          <p>
            Three-axis MPU6050 accelerometer, non-contact infrared thermal probe, and SCT-013 current clamp
          </p>
        </div>

        {/* Machine dropdown picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Target Machine:
          </label>
          <select
            className="form-select"
            style={{ fontWeight: 700, color: 'var(--cyan-primary)', minWidth: '220px' }}
            value={selectedMachineId}
            onChange={(e) => onSelectMachine(Number(e.target.value))}
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_code} - {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIVA DEMO FAULT INJECTOR BAR */}
      <FaultInjector selectedMachineId={selectedMachineId} />

      {/* MACHINE BANNER */}
      {activeMachine && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-primary)' }}>
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                {activeMachine.machine_code}: {activeMachine.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activeMachine.type} • {activeMachine.location} • {activeMachine.rated_power_kw} kW @ {activeMachine.rated_rpm} RPM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Operational Health</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: healthScore >= 80 ? 'var(--emerald-primary)' : healthScore >= 60 ? 'var(--amber-warning)' : 'var(--red-critical)', fontFamily: 'var(--font-mono)' }}>
                {healthScore}%
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Continuous Runtime</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="var(--cyan-primary)" />
                {runtimeFormatted}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Vibration Standard</span>
              <IsoSeverityBadge rms={rms} />
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME GAUGES ROW */}
      <div className="grid-cols-4">
        <MetricCard
          title="RMS Vibration Velocity"
          value={rms}
          unit="mm/s"
          icon={Activity}
          status={rms >= 7.1 ? 'critical' : rms >= 4.5 ? 'warning' : 'healthy'}
          subtext="ISO 10816-3 Overall"
          trend={rms >= 4.5 ? 'Threshold Exceeded' : 'Zone A/B Normal'}
        />

        <MetricCard
          title="Bearing Surface Temp"
          value={temp}
          unit="°C"
          icon={Flame}
          status={temp >= 85 ? 'critical' : temp >= 70 ? 'warning' : 'healthy'}
          subtext="Contactless IR MLX90614"
          trend={temp >= 70 ? 'High thermal gradient' : 'Within Class F limits'}
        />

        <MetricCard
          title="CT Clamp Phase Current"
          value={current}
          unit="Amps"
          icon={Zap}
          status={current >= 18 ? 'critical' : current >= 14 ? 'warning' : 'healthy'}
          subtext="RMS AC Amperes (SCT-013)"
          trend="Load: 68% of Full Load"
        />

        <MetricCard
          title="Dominant Peak Frequency"
          value={freq}
          unit="Hz"
          icon={BarChart2}
          status="healthy"
          subtext="1X Fundamental Rotor Speed"
          trend="FFT Edge Spectral Peak"
        />
      </div>

      {/* ROLLING 60-SECOND TIME SERIES STREAM */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Radio size={18} color="var(--cyan-primary)" />
            Rolling 60-Second Telemetry Stream (Vibration, Temperature & Current)
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Stream Interval: 1000 ms • Points in Buffer: {history60s.length}
          </span>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <Line data={rollingChartData} options={rollingChartOptions} />
        </div>
      </div>

      {/* LOWER SPLIT: FFT FREQUENCY SPECTRUM & 3-AXIS ACCELERATION */}
      <div className="grid-cols-2">
        {/* FFT Spectrum */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart2 size={18} color="var(--cyan-primary)" />
              Vibration FFT Frequency Spectrum (5 Hz – 120 Hz)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              1X & 2X Harmonic Peaks
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Isolates unbalance (1X = {freq}Hz), shaft misalignment (2X = {(freq * 2).toFixed(1)}Hz), and high-frequency bearing cage defects.
          </p>
          <div style={{ height: '220px', width: '100%' }}>
            <Bar data={fftChartData} options={fftChartOptions} />
          </div>
        </div>

        {/* 3-Axis Acceleration Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="var(--emerald-primary)" />
              Three-Axis Acceleration Decomposition (X, Y, Z)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              MPU-6050 Accelerometer
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Radial horizontal (X), radial vertical (Y), and axial thrust (Z) acceleration components in gravity (g).
          </p>
          <div style={{ height: '220px', width: '100%' }}>
            <Bar data={axisChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { suggestedMax: 3.0, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(28, 46, 79, 0.3)' } }, x: { ticks: { color: '#cbd5e1' }, grid: { display: false } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
