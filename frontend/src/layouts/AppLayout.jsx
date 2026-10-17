import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useSensorData } from '../hooks/useSensorData';
import { api } from '../services/api';
import { AlertOctagon, X } from 'lucide-react';

export function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const { isConnected, lastNotification } = useSensorData(1);
  const [toastAlert, setToastAlert] = useState(null);

  // Derive page title from current path
  function getPageTitle() {
    switch (location.pathname) {
      case '/dashboard':
        return 'Fleet Condition Dashboard';
      case '/motors':
        return 'Industrial Motors Fleet Management';
      case '/live-monitoring':
        return 'Real-Time Sensor Telemetry';
      case '/alerts':
        return 'Predictive Maintenance Alerts';
      case '/maintenance':
        return 'Machinery Servicing & Maintenance History';
      case '/analytics':
        return 'Fleet Telemetry & Operational Analytics';
      case '/settings':
        return 'System & Plant Settings';
      default:
        return 'MotorVibe Industrial Platform';
    }
  }

  // Poll active alerts count
  async function fetchAlertCount() {
    try {
      const res = await api.getAlerts({ status: 'Active' });
      if (res.success) {
        setActiveAlertCount(res.data.length);
      }
    } catch (err) {
      // non-blocking
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlertCount();
      const interval = setInterval(fetchAlertCount, 6000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Real-time critical alarm toast
  useEffect(() => {
    if (lastNotification && lastNotification.severity?.toLowerCase() === 'critical') {
      setToastAlert(lastNotification);
      const timer = setTimeout(() => setToastAlert(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [lastNotification]);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Authenticating MotorVibe session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeAlertCount={activeAlertCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* MAIN VIEW CONTENT AREA */}
      <div className="main-content">
        <TopBar
          pageTitle={getPageTitle()}
          isSocketConnected={isConnected}
          activeAlertCount={activeAlertCount}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Real-time Critical Alarm Toast */}
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#ffffff',
            border: '1px solid var(--status-critical-border)',
            borderLeft: '4px solid var(--status-critical)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            maxWidth: '440px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertOctagon size={22} color="var(--status-critical)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
                CRITICAL HAZARD
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {toastAlert.equipment_code || toastAlert.machine_code}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {toastAlert.message}
            </div>
          </div>
          <button
            onClick={() => setToastAlert(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
