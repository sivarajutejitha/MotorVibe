import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Radio, User, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function TopBar({ pageTitle, isSocketConnected = true, activeAlertCount = 0, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="topbar">
      <div className="topbar-left">
        {onToggleSidebar && (
          <button
            className="btn btn-outline btn-sm btn-icon"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
        )}
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
        {/* Real-time telemetry connection status */}
        <div className={`live-indicator ${isSocketConnected ? '' : 'offline'}`}>
          <span className="live-dot" />
          <span>{isSocketConnected ? 'Live Stream Active' : 'Disconnected'}</span>
        </div>

        {/* Notifications Icon with Active Alerts Badge */}
        <Link
          to="/alerts"
          className="btn btn-outline btn-sm btn-icon"
          style={{ position: 'relative' }}
          title="Active Alerts"
        >
          <Bell size={18} />
          {activeAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-critical)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px #fff',
              }}
            >
              {activeAlertCount}
            </span>
          )}
        </Link>

        {/* User Profile Info */}
        <div className="user-profile-badge">
          <div className="user-avatar">{userInitial}</div>
          <div className="user-meta">
            <span className="user-name">{user?.full_name || 'Plant Operator'}</span>
            <span className="user-role">{user?.organization || 'Industrial Plant'}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
          title="Logout from MotorVibe"
          style={{ gap: '0.35rem' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
