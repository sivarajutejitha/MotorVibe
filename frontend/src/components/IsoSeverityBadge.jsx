import React from 'react';

export function IsoSeverityBadge({ rms = 0 }) {
  const value = Number(rms) || 0;

  let zone = 'Zone A';
  let label = 'Healthy (Good)';
  let badgeClass = 'badge-healthy';

  if (value >= 7.1) {
    zone = 'Zone D';
    label = 'Critical Hazard';
    badgeClass = 'badge-critical';
  } else if (value >= 4.5) {
    zone = 'Zone C';
    label = 'Warning Alert';
    badgeClass = 'badge-warning';
  } else if (value >= 2.8) {
    zone = 'Zone B';
    label = 'Satisfactory';
    badgeClass = 'badge-info';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span className={`badge ${badgeClass}`}>
        {zone}: {label}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
        {value.toFixed(2)} mm/s
      </span>
    </div>
  );
}
