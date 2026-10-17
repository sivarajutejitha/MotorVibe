import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { 
  Activity, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Radio, 
  Layers,
  BarChart3,
  Server
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { IsoSeverityBadge } from '../components/IsoSeverityBadge';

export function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section style={{ padding: '4.5rem 2rem 3rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              backgroundColor: 'var(--blue-subtle)',
              border: '1px solid var(--blue-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--blue-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '0.04em',
            }}
          >
            <Activity size={15} />
            INDUSTRY 4.0 PREDICTIVE MAINTENANCE PLATFORM
          </div>

          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              maxWidth: '850px',
              margin: '0 auto 1.25rem',
            }}
          >
            Monitor Smarter. <span style={{ color: 'var(--blue-primary)' }}>Maintain Before Failure.</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              maxWidth: '720px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            MotorVibe continuously monitors industrial electric induction motors for vibration anomalies (ISO 10816-3), bearing thermal gradients, phase current draw, and operational runtime — transforming reactive breakdowns into scheduled uptime.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn btn-outline btn-lg">
              View Live Dashboard
            </Link>
          </div>

          {/* VISUAL DASHBOARD PREVIEW USING ACTUAL REUSABLE REACT COMPONENTS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              padding: '1.75rem',
              textAlign: 'left',
              maxWidth: '1060px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                  Live Telemetry Digital Twin
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.1rem 0' }}>
                  Slurry Pump Station Alpha (MTR-101)
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="live-indicator">
                  <span className="live-dot" />
                  Streaming Telemetry
                </span>
                <IsoSeverityBadge rms={2.21} />
              </div>
            </div>

            <div className="grid-cols-4" style={{ marginBottom: '1.25rem' }}>
              <MetricCard
                title="Vibration RMS"
                value="2.21"
                unit="mm/s"
                icon={Activity}
                status="healthy"
                subtext="ISO 10816 Zone A/B"
                trend="Healthy baseline"
              />
              <MetricCard
                title="Bearing Temp"
                value="53.5"
                unit="°C"
                icon={Flame}
                status="healthy"
                subtext="Normal thermal limit"
                trend="Stable <70°C"
              />
              <MetricCard
                title="Current Draw"
                value="9.3"
                unit="A"
                icon={Zap}
                status="healthy"
                subtext="65% rated capacity"
                trend="Balanced 3-Phase"
              />
              <MetricCard
                title="Total Runtime"
                value="3,445"
                unit="Hrs"
                icon={Clock}
                status="info"
                subtext="Next service in 75 days"
                trend="Optimal health"
              />
            </div>

            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--status-healthy)" />
                Connected to PostgreSQL telemetry pool & MQTT broker (HiveMQ)
              </span>
              <Link to="/dashboard" style={{ fontWeight: 600, color: 'var(--blue-primary)', textDecoration: 'none' }}>
                Explore Full Plant Fleet →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="features" style={{ padding: '4.5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Core Capabilities
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            Built for Industrial Reliability
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1rem' }}>
            Four pillars of electrical machine protection engineered according to international vibration & thermal standards.
          </p>
        </div>

        <div className="grid-cols-4">
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--blue-subtle)', color: 'var(--blue-primary)', width: '44px', height: '44px', marginBottom: '1rem' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              1. Real-Time Vibration Monitoring
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Tri-axial MPU6050 accelerometer integration derived into velocity RMS (mm/s) conforming to ISO 10816-3 severity zones for early unbalance detection.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)', width: '44px', height: '44px', marginBottom: '1rem' }}>
              <Flame size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              2. Thermal Overload Detection
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Continuous MLX90614 infrared contactless thermal measurement guarding motor windings and bearing cavities against Class F insulation thermal degradation.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--status-healthy-bg)', color: 'var(--status-healthy)', width: '44px', height: '44px', marginBottom: '1rem' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              3. Motor Runtime Tracking
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Cumulative operational hours logging to track preventive servicing intervals, bearing regreasing intervals, and dynamic duty-cycle utilization.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--status-critical-bg)', color: 'var(--status-critical)', width: '44px', height: '44px', marginBottom: '1rem' }}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              4. Predictive Maintenance Alerts
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Rule-based early warning system with automatic alert debouncing, operator acknowledgement audit trail, and explainable remedial maintenance guidance.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{ padding: '4.5rem 2rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Architecture
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem', marginBottom: '2.5rem' }}>
            How MotorVibe Works
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              maxWidth: '1080px',
              margin: '0 auto',
            }}
          >
            {/* Step 1 */}
            <div style={{ flex: '1 1 180px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-subtle)', color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Cpu size={22} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>1. Sensors / Sim</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                MPU6050, IR Temp, CT Clamp edge capture
              </p>
            </div>

            <div style={{ color: 'var(--text-light)', fontWeight: 800 }}>→</div>

            {/* Step 2 */}
            <div style={{ flex: '1 1 180px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Radio size={22} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>2. MQTT Broker</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Lightweight publish/subscribe messaging
              </p>
            </div>

            <div style={{ color: 'var(--text-light)', fontWeight: 800 }}>→</div>

            {/* Step 3 */}
            <div style={{ flex: '1 1 180px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Server size={22} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>3. Node.js Backend</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Express REST APIs, alert engine, WebSocket broadcast
              </p>
            </div>

            <div style={{ color: 'var(--text-light)', fontWeight: 800 }}>→</div>

            {/* Step 4 */}
            <div style={{ flex: '1 1 180px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-healthy-bg)', color: 'var(--status-healthy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Database size={22} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>4. PostgreSQL</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Relational time-series telemetry & maintenance logs
              </p>
            </div>

            <div style={{ color: 'var(--text-light)', fontWeight: 800 }}>→</div>

            {/* Step 5 */}
            <div style={{ flex: '1 1 180px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-subtle)', color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <BarChart3 size={22} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>5. React Dashboard</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Recharts real-time graphs & fleet analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section style={{ padding: '4.5rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Project Background
        </span>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem', marginBottom: '1rem' }}>
          About MotorVibe
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Electric induction motors account for over 70% of total electrical energy consumed across industrial manufacturing plants. Unexpected motor failure leads to severe production downtime, safety hazards, and exorbitant emergency repair costs. MotorVibe implements an Industry 4.0 predictive maintenance workflow by combining IoT telemetry, ISO 10816-3 international standards, and responsive web visualization.
        </p>
        <Link to="/about" className="btn btn-outline">
          Read Comprehensive Project Specification →
        </Link>
      </section>

      {/* 5. FOOTER */}
      <footer style={{ marginTop: 'auto', backgroundColor: '#f1f5f9', borderTop: '1px solid var(--border-color)', padding: '2.5rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '28px', height: '28px' }}>
              <Activity size={16} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>MotorVibe</span>
            <span>— Industry 4.0 Industrial Motor Health Dashboard</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About</Link>
            <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
            <Link to="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</Link>
          </div>

          <div>
            <span>Contact / Review Placeholder: </span>
            <strong style={{ color: 'var(--text-main)' }}>support@motorvibe.io</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
