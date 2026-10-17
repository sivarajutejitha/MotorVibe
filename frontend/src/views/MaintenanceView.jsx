import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { Wrench, Plus, Calendar, User, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export function MaintenanceView() {
  const [records, setRecords] = useState([]);
  const [machines, setMachines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [recRes, machRes] = await Promise.all([
        api.getMaintenance(),
        api.getMachines(),
      ]);
      if (recRes.success) setRecords(recRes.data);
      if (machRes.success) setMachines(machRes.data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Machinery Predictive Maintenance Records</h1>
          <p>Technician servicing audit log, bearing grease replenishment, and rotor balancing records</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={loadData}>
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="btn btn-emerald btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Log Maintenance Activity
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {records.map((r) => (
          <div key={r.id} className="card" style={{ borderLeft: '4px solid var(--emerald-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div>
                <span className="badge badge-healthy" style={{ marginRight: '0.6rem' }}>
                  {r.maintenance_type}
                </span>
                <span style={{ fontWeight: 800, color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                  {r.machine_code}
                </span>
                <span style={{ color: '#fff', fontWeight: 600, marginLeft: '0.4rem' }}>
                  {r.machine_name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <User size={13} color="var(--cyan-primary)" />
                  {r.technician_name}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} />
                  {new Date(r.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.5rem' }}>
              <strong>Observation:</strong> {r.description}
            </div>

            {r.parts_replaced && (
              <div style={{ fontSize: '0.82rem', color: 'var(--amber-warning)', marginBottom: '0.4rem' }}>
                <strong>Parts / Consumables Replaced:</strong> {r.parts_replaced}
              </div>
            )}

            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--emerald-primary)' }}>Corrective Action Performed:</strong> {r.action_taken}
            </div>
          </div>
        ))}
      </div>

      <LogMaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machines={machines}
        onRecordCreated={loadData}
      />
    </div>
  );
}
