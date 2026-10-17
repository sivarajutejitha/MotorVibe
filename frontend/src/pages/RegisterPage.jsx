import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Mail, Lock, Check, X, AlertCircle, ArrowRight } from 'lucide-react';

export function RegisterPage({ setActivePage }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'engineer',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const pwd = formData.password;
  const hasMinLength = pwd.length >= 6;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  let strengthScore = 0;
  if (hasMinLength) strengthScore++;
  if (hasUppercase) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSpecial) strengthScore++;

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['var(--red-critical)', 'var(--amber-warning)', 'var(--cyan-secondary)', 'var(--emerald-primary)'];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 65px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 60%), var(--bg-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-emerald)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--emerald-primary), var(--cyan-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            margin: '0 auto 1rem',
            boxShadow: '0 0 20px var(--emerald-glow)'
          }}>
            <Activity size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
            Create Operator Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Register to monitor industrial machinery and log predictive maintenance
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--red-critical)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="e.g. S. Ramanathan"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
              <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="operator@plant.io"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Plant Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="engineer">Reliability & Vibration Engineer</option>
              <option value="operator">Plant Shift Operator</option>
              <option value="admin">Plant Maintenance Superintendent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="Minimum 6 characters"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Password strength feedback */}
            {pwd.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Password Strength:</span>
                  <span style={{ color: strengthColors[Math.max(0, strengthScore - 1)], fontWeight: 600 }}>
                    {strengthLabels[Math.max(0, strengthScore - 1)]}
                  </span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(strengthScore / 4) * 100}%`,
                    height: '100%',
                    background: strengthColors[Math.max(0, strengthScore - 1)],
                    transition: 'all 0.3s'
                  }} />
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="Re-enter password"
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-emerald"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <a href="#login" onClick={(e) => { e.preventDefault(); setActivePage('login'); }}>
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
}
