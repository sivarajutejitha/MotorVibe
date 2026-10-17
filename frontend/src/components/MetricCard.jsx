import React from 'react';

export function MetricCard({ title, value, unit, icon: Icon, status = 'healthy', subtext, trend }) {
  return (
    <div className={`metric-card ${status}`}>
      <div className="metric-card-top">
        <span className="metric-card-title">{title}</span>
        {Icon && (
          <div className="metric-icon-box">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="metric-card-body">
        <span className="metric-value">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      <div className="metric-card-footer">
        {subtext && <span>{subtext}</span>}
        {trend && (
          <span
            style={{
              marginLeft: 'auto',
              fontWeight: 600,
              color: status === 'critical' ? 'var(--status-critical)' : status === 'warning' ? 'var(--status-warning)' : 'var(--status-healthy)',
            }}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
