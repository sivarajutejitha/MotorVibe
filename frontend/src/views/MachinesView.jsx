import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AddMachineModal } from '../components/AddMachineModal';
import { Cpu, Plus, Trash2, ArrowUpRight, Search, Filter } from 'lucide-react';

export function MachinesView({ onSelectMachine, onNavigateTab }) {
  const [machines, setMachines] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadMachines() {
    try {
      const res = await api.getMachines();
      if (res.success) setMachines(res.data);
    } catch (err) {
      console.error('Failed to load machines:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMachines();
  }, []);

  async function handleDelete(id, code) {
    if (window.confirm(`Are you sure you want to delete machine asset ${code}? All historical telemetry and sensor links will be purged.`)) {
      try {
        await api.deleteMachine(id);
        loadMachines();
      } catch (err) {
        alert(`Failed to delete machine: ${err.message}`);
      }
    }
  }

  const filtered = machines.filter((m) => {
    const matchFilter = filter === 'ALL' || m.status === filter;
    const matchSearch = m.machine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Industrial Machine Assets Directory</h1>
          <p>Electric drive systems, nameplate specifications, and sensor instrumentations</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add Machine Asset
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.3rem', fontSize: '0.85rem' }}
            placeholder="Search code, name, bay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Machinery Table */}
      <div className="table-container card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Tag Code</th>
              <th>Machine Name</th>
              <th>Motor Class</th>
              <th>Location</th>
              <th>Rating (kW / RPM)</th>
              <th>Current (A)</th>
              <th>Health Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <span style={{ fontWeight: 800, color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                    {m.machine_code}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{m.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>ID: #{m.id}</div>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.type}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.location}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{m.rated_power_kw} kW</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}> @ {m.rated_rpm} RPM</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  {m.rated_current_a} A
                </td>
                <td>
                  <span className={`badge badge-${m.status.toLowerCase()}`}>
                    {m.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        onSelectMachine(m.id);
                        onNavigateTab('live');
                      }}
                      title="Open Live Telemetry Monitoring"
                    >
                      <ArrowUpRight size={14} color="var(--cyan-primary)" />
                      Live
                    </button>
                    {m.id > 4 && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(m.id, m.machine_code)}
                        title="Delete asset from database"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddMachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMachineCreated={loadMachines}
      />
    </div>
  );
}
