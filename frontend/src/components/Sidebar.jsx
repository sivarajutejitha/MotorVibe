import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Cpu, 
  Radio, 
  BarChart3, 
  AlertTriangle, 
  Wrench, 
  Settings, 
  Database,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ activeAlertCount = 0, isCollapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/motors', label: 'Motors', icon: Cpu },
    { path: '/live-monitoring', label: 'Live Monitoring', icon: Radio },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertCount },
    { path: '/maintenance', label: 'Maintenance History', icon: Wrench },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '30px', height: '30px' }}>
              <Activity size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Motor<span style={{ color: 'var(--blue-primary)' }}>Vibe</span>
            </span>
          </div>
        )}

        <button
          className="btn btn-outline btn-sm btn-icon"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{ marginLeft: isCollapsed ? 'auto' : '0', marginRight: isCollapsed ? 'auto' : '0' }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={19} />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && Boolean(item.badge && item.badge > 0) && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          {user && (
            <div 
              style={{ 
                padding: '0.5rem 0.65rem', 
                backgroundColor: '#f1f5f9', 
                borderRadius: 'var(--radius-sm)', 
                marginBottom: '0.65rem', 
                border: '1px solid var(--border-color)' 
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Active Operator
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name || 'Plant Operator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--blue-primary)', fontWeight: 600 }}>
                {user.email}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-healthy)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
            <Database size={14} />
            <span style={{ fontWeight: 600 }}>PostgreSQL Telemetry Live</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.72rem' }}>
            <CheckCircle2 size={13} color="var(--blue-primary)" />
            <span>ISO 10816-3 Severity Standards</span>
          </div>
        </div>
      )}
    </aside>
  );
}
