import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

export function Navbar({ isSocketConnected = true }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  return (
    <header className="public-navbar">
      <Link to="/" className="nav-brand">
        <div className="brand-icon-wrapper">
          <Activity size={20} />
        </div>
        <div>
          <span>Motor<span style={{ color: 'var(--blue-primary)' }}>Vibe</span></span>
          <span style={{ fontSize: '0.68rem', display: 'block', color: 'var(--text-light)', fontWeight: 600, letterSpacing: '0.04em' }}>
            INDUSTRY 4.0 HEALTH DASHBOARD
          </span>
        </div>
      </Link>

      <nav>
        <ul className="public-nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <a href="/#features">Features</a>
          </li>
          <li>
            <a href="/#how-it-works">How It Works</a>
          </li>
          <li>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
              About
            </Link>
          </li>
        </ul>
      </nav>

      <div className="public-nav-actions">
        {/* Live Simulator Status Badge */}
        <div className={`live-indicator ${isSocketConnected ? '' : 'offline'}`} style={{ marginRight: '0.5rem' }}>
          <span className="live-dot" />
          <span>{isSocketConnected ? 'Telemetry Live' : 'Disconnected'}</span>
        </div>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              Operator: <strong style={{ color: 'var(--blue-primary)' }}>{user?.full_name || 'Industrial Demo User'}</strong>
            </span>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              <LayoutDashboard size={15} />
              View Dashboard
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              <LogIn size={14} />
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              <UserPlus size={14} />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
