import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            padding: '2.5rem',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}>
              <Activity size={26} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Sign In to MotorVibe
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Access predictive telemetry and fleet condition monitoring
            </p>
          </div>

          {error && (
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
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="name@plant.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--blue-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 0 }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for Project Review */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.65rem' }}>
              Quick Fill for Project Review (Seeded in PostgreSQL):
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleDemoLogin('demo@motorvibe.io', 'Password123!')}
              >
                Demo User
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleDemoLogin('admin@motorvibe.io', 'Admin@123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleDemoLogin('operator@motorvibe.io', 'Operator@123')}
              >
                Operator
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--blue-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Placeholder */}
      {forgotModal && (
        <div className="modal-backdrop" onClick={() => setForgotModal(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Password Reset Flow</div>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setForgotModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                In an on-premise industrial plant deployment, password resets require verification by the designated plant system administrator.
              </p>
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <strong>Default Project Credentials:</strong>
                <div>Email: <code>demo@motorvibe.io</code></div>
                <div>Password: <code>Password123!</code></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setForgotModal(false)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
