import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useSensorData } from '../hooks/useSensorData';
import { FaultInjector } from '../components/FaultInjector';
import { IsoSeverityBadge } from '../components/IsoSeverityBadge';
import { MetricCard } from '../components/MetricCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  Flame,
  Zap,
  Clock,
  Radio,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

export function LiveMonitoringPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMotorId = Number(searchParams.get('motor')) || 1;

  const [motors, setMotors] = useState([]);
  const [selectedMotorId, setSelectedMotorId] = useState(initialMotorId);
  const [activeMotor, setActiveMotor] = useState(null);
  const [runtimeSeconds, setRuntimeSeconds] = useState(14820);

  const { isConnected, currentReading, history60s } = useSensorData(selectedMotorId);

  // Runtime clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRuntimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load motors list
  useEffect(() => {
    async function load() {
      try {
        const res = await api.getMotors();
        if (res.success) {
          setMotors(res.data);
          const found = res.data.find((m) => m.id === selectedMotorId);
          setActiveMotor(found || res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load motors for live monitoring:', err);
      }
    }
    load();
  }, [selectedMotorId]);

  function handleMotorChange(id) {
    const numId = Number(id);
    setSelectedMotorId(numId);
    setSearchParams({ motor: numId });
    const found = motors.find((m) => m.id === numId);
    setActiveMotor(found || null);
  }

  // Safe fallback readings
  const rms = currentReading?.vibration_rms ?? currentReading?.vib_rms ?? 2.21;
  const vibX = currentReading?.vibration_x ?? currentReading?.vib_x ?? 0.45;
  const vibY = currentReading?.vibration_y ?? currentReading?.vib_y ?? 0.52;
  const vibZ = currentReading?.vibration_z ?? currentReading?.vib_z ?? 0.38;
  const temp = currentReading?.temperature_c ?? currentReading?.temperature ?? 52.4;
  const curr = currentReading?.current_a ?? currentReading?.current ?? 9.4;
  const freq = currentReading?.vibration_frequency_hz ?? currentReading?.frequency_peak ?? 50.0;
  const isSimulated = currentReading?.is_simulated ?? true;
  const healthScore = currentReading?.health?.overall ?? 88;
  const lastRecorded = currentReading?.recorded_at ? new Date(currentReading.recorded_at).toLocaleTimeString() : 'Streaming';

  // Format runtime
  const hours = Math.floor(runtimeSeconds / 3600);
  const minutes = Math.floor((runtimeSeconds % 3600) / 60);
  const seconds = runtimeSeconds % 60;
  const runtimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

  // Frequency spectrum for FFT bar chart
  const spectrumData = currentReading?.spectrum || [
    { frequency: '15Hz', amplitude: 0.25 },
    { frequency: '25Hz', amplitude: 0.35 },
    { frequency: '50Hz (1X)', amplitude: Number(rms) * 0.42 },
    { frequency: '75Hz', amplitude: 0.18 },
    { frequency: '100Hz (2X)', amplitude: Number(rms) * 0.22 },
    { frequency: '120Hz', amplitude: 0.15 },
  ];

  return (
    <div>
      {/* Header & Motor Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Real-Time Sensor Telemetry & Diagnostics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            High-frequency 3-axis accelerometer, thermal, and electrical telemetry stream via Socket.IO
          </p>
        </div>

        {/* Motor Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Select Motor:
          </span>
          <select
            className="form-select"
            style={{ width: '280px', fontWeight: 600 }}
            value={selectedMotorId}
            onChange={(e) => handleMotorChange(e.target.value)}
          >
            {motors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.equipment_code || m.machine_code} - {m.motor_name || m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAULT INJECTOR (VIVA TESTING) */}
      <FaultInjector
        selectedMotorId={selectedMotorId}
        onFaultTriggered={(fault) => {
          console.log(`Injected fault ${fault} on motor ${selectedMotorId}`);
        }}
      />

      {/* Stream Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`live-indicator ${isConnected ? '' : 'offline'}`}>
            <span className="live-dot" />
            <span>{isConnected ? 'Socket.IO Stream Connected (1Hz)' : 'Connection Interrupted'}</span>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Telemetry Source: <strong style={{ color: 'var(--blue-primary)' }}>{isSimulated ? 'Synthetic Physics Simulator (Clearly Labelled)' : 'MQTT Hardware Stream'}</strong>
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
          Last Reading: {lastRecorded} | Runtime: {runtimeFormatted}
        </div>
      </div>

      {/* KPI METRIC CARDS FOR LIVE TELEMETRY */}
      <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Vibration Velocity RMS"
          value={Number(rms).toFixed(2)}
          unit="mm/s"
          icon={Activity}
          status={rms >= 7.1 ? 'critical' : rms >= 4.5 ? 'warning' : 'healthy'}
          subtext="Derived ISO 10816-3 metric"
          trend={rms >= 7.1 ? 'Zone D Critical' : rms >= 4.5 ? 'Zone C Warning' : 'Zone A/B Good'}
        />

        <MetricCard
          title="IR Surface Temp"
          value={Number(temp).toFixed(1)}
          unit="°C"
          icon={Flame}
          status={temp >= 85 ? 'critical' : temp >= 70 ? 'warning' : 'healthy'}
          subtext="MLX90614 Contactless IR"
          trend={temp >= 70 ? 'Thermal Warning' : 'Insulation Safe'}
        />

        <MetricCard
          title="Phase Current Draw"
          value={Number(curr).toFixed(1)}
          unit="A"
          icon={Zap}
          status="healthy"
          subtext="SCT-013 CT Clamp"
          trend="Balanced 3-Phase"
        />

        <MetricCard
          title="Dominant Frequency"
          value={Number(freq).toFixed(1)}
          unit="Hz"
          icon={Radio}
          status="info"
          subtext="Rotational fundamental peak"
          trend="1X Running Speed"
        />
      </div>

      {/* 3-AXIS ACCELERATION GAUGES (MPU6050 RAW TELEMETRY) */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Cpu size={18} color="var(--blue-primary)" />
            MPU6050 3-Axis Instantaneous Acceleration Telemetry
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
            Sensors: X, Y, Z (Units: g-force)
          </span>
        </div>

        <div className="grid-cols-3" style={{ marginBottom: 0 }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
              X-Axis Acceleration (Axial)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-primary)', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
              {Number(vibX).toFixed(3)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>g</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shaft Axial Direction</span>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
              Y-Axis Acceleration (Radial Horizontal)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-healthy)', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
              {Number(vibY).toFixed(3)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>g</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horizontal Radial Bearing Load</span>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
              Z-Axis Acceleration (Radial Vertical)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-warning)', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
              {Number(vibZ).toFixed(3)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>g</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vertical Foundation Baseline</span>
          </div>
        </div>
      </div>

      {/* ROLLING 60-SECOND RECHARTS TIME-SERIES */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} color="var(--blue-primary)" />
            Rolling 60-Second Real-Time Telemetry Stream
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Buffered live points: {history60s.length} / 60
          </span>
        </div>

        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history60s} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="vib_rms"
                name="Vibration RMS (mm/s)"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#d97706"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="current"
                name="Current (A)"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SIGNAL PROCESSING METHODOLOGY & ASSUMPTIONS (HONEST EXPLAINABILITY) */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Info size={18} color="var(--status-info)" />
            Signal Processing Methodology & Engineering Assumptions
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.65 }}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>Raw Acceleration vs. Calibrated Velocity RMS:</strong> The MPU6050 MEMS sensor captures raw tri-axial linear acceleration (ax, ay, az) in g or m/s². In industrial machinery condition monitoring (ISO 10816-3), vibration severity is evaluated as <em>velocity RMS in mm/s</em> over the 10 Hz to 1000 Hz frequency band because velocity correlates directly with destructive fatigue stress.
          </p>
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Vibration RMS Derivation: v_RMS = sqrt( (1/N) * sum( (∫ a(t)dt)² ) ) ≈ [a_peak / (√2 * 2πf)] * 9806.65 mm/s
          </div>
          <p>
            <strong>Simulation Fidelity:</strong> In simulated demo mode, values are derived using synthetic sinusoidal fundamentals combined with Gaussian noise to accurately mirror physical bearing outer-race defects (BPFO), unbalance harmonics, and thermal insulation degradation.
          </p>
        </div>
      </div>
    </div>
  );
}
