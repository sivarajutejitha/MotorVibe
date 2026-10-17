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
  ChevronRight
} from 'lucide-react';

export function Sidebar({ activeAlertCount = 0, isCollapsed = false, onToggleCollapse }) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-healthy)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
            <Database size={14} />
            <span style={{ fontWeight: 600 }}>PostgreSQL Connected</span>
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
