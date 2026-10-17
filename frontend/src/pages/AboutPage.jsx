import React from 'react';
import { Navbar } from '../components/Navbar';
import { 
  AlertTriangle, 
  Cpu, 
  Database, 
  Radio, 
  Server, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight,
  Zap,
  Flame,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '3.5rem 2rem', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Capstone Project Documentation
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>
            About MotorVibe
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
            An Industry 4.0 predictive maintenance platform engineered to monitor the real-time electrical, thermal, and mechanical health of industrial induction motors.
          </p>
        </div>

        {/* 1. Problem Statement */}
        <section className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-critical-bg)', color: 'var(--status-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              The Problem: Unplanned Industrial Motor Failure
            </h2>
          </div>
          <p style={{ color: 'var(--text-body)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
            3-phase electric induction motors are the unsung workhorses of modern industry, driving slurry pumps, cooling fans, air compressors, conveyor belts, and precision spindles. They account for over <strong>70% of total electrical energy</strong> consumed in manufacturing plants.
          </p>
          <p style={{ color: 'var(--text-body)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
            Traditional maintenance follows two flawed paradigms:
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.92rem' }}>
            <li><strong>Reactive Maintenance (Run-to-failure):</strong> Machines run until catastrophic mechanical failure occurs, causing unpredicted downtime, hazardous flying fragments, secondary damage to gearboxes, and emergency repair overtime.</li>
            <li><strong>Calendar-Based Preventive Maintenance:</strong> Machines are overhauled according to fixed schedules regardless of actual physical health, leading to wasted technician hours and unnecessary replacement of healthy components.</li>
          </ul>
        </section>

        {/* 2. The Predictive Maintenance Solution */}
        <section className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-healthy-bg)', color: 'var(--status-healthy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              The Solution: Continuous Condition Monitoring
            </h2>
          </div>
          <p style={{ color: 'var(--text-body)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
            MotorVibe continuously streams real-time physical telemetry to detect mechanical degradation <em>weeks before</em> audible noise or total failure:
          </p>
          <div className="grid-cols-3" style={{ marginBottom: 0 }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--blue-primary)', display: 'block', marginBottom: '0.25rem' }}>ISO 10816-3 Vibration</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Evaluates Root Mean Square (RMS) velocity in mm/s to classify vibration into Zone A (Good), Zone B (Acceptable), Zone C (Alert/Warning), and Zone D (Critical Danger).
              </span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--status-warning)', display: 'block', marginBottom: '0.25rem' }}>Thermal Insulation Guard</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Guards motor winding temperature against Class F insulation threshold limits (70°C warning, 85°C critical) to prevent stator burnouts.
              </span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--status-healthy)', display: 'block', marginBottom: '0.25rem' }}>Current Transformer (CT)</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Detects overcurrent, phase unbalance, and mechanical stalling over 110%–135% of nameplate rated current.
              </span>
            </div>
          </div>
        </section>

        {/* 3. Technology Stack & Architecture */}
        <section className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-subtle)', color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Full-Stack Architecture & Technology Stack
            </h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Technology</th>
                  <th>Implementation Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Frontend</strong></td>
                  <td>React + Vite + JSX</td>
                  <td>Single Page Application with React Router v7, custom hooks, and state management</td>
                </tr>
                <tr>
                  <td><strong>Styling</strong></td>
                  <td>Modern Industrial CSS</td>
                  <td>Minimal, high-contrast, light-mode industrial design system with responsive layouts</td>
                </tr>
                <tr>
                  <td><strong>Charts</strong></td>
                  <td>Recharts</td>
                  <td>Line charts, area charts, bar charts, and donut charts with custom responsive tooltips</td>
                </tr>
                <tr>
                  <td><strong>Backend</strong></td>
                  <td>Node.js & Express.js</td>
                  <td>REST APIs, centralized error handling, input validation, and JWT security</td>
                </tr>
                <tr>
                  <td><strong>Database</strong></td>
                  <td>PostgreSQL 14+ / 18+</td>
                  <td><code>pg</code> connection pool, parameterized queries, indexes, and normalized relational schema</td>
                </tr>
                <tr>
                  <td><strong>Real-Time Stream</strong></td>
                  <td>Socket.IO</td>
                  <td>Bidirectional WebSocket communication streaming live 1Hz telemetry snapshots</td>
                </tr>
                <tr>
                  <td><strong>IIoT Messaging</strong></td>
                  <td>MQTT (<code>mqtt</code> package)</td>
                  <td>Industrial sensor telemetry subscriber with HiveMQ broker support</td>
                </tr>
                <tr>
                  <td><strong>Simulation Mode</strong></td>
                  <td>Physics Simulation Engine</td>
                  <td>Generates synthetic telemetry with fault injection for live demonstrations without hardware</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Navigation Action */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Launch Fleet Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}
