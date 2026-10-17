/**
 * MotorVibe Frontend API Service
 * Centralized HTTP request client with Bearer token authentication and REST endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('motorvibe_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Call failed [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  signup: (userData) => request('/auth/signup', { method: 'POST', body: userData }),
  register: (userData) => request('/auth/signup', { method: 'POST', body: userData }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),

  // Motors
  getMotors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/motors${query ? `?${query}` : ''}`);
  },
  getMotor: (id) => request(`/motors/${id}`),
  createMotor: (data) => request('/motors', { method: 'POST', body: data }),
  updateMotor: (id, data) => request(`/motors/${id}`, { method: 'PUT', body: data }),
  deleteMotor: (id) => request(`/motors/${id}`, { method: 'DELETE' }),

  // Compatibility aliases for machines
  getMachines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/motors${query ? `?${query}` : ''}`);
  },
  getMachine: (id) => request(`/motors/${id}`),
  createMachine: (data) => request('/motors', { method: 'POST', body: data }),
  updateMachine: (id, data) => request(`/motors/${id}`, { method: 'PUT', body: data }),
  deleteMachine: (id) => request(`/motors/${id}`, { method: 'DELETE' }),

  // Sensors
  getSensors: (motorId) => request(`/sensors${motorId ? `?motor_id=${motorId}` : ''}`),
  getSensor: (id) => request(`/sensors/${id}`),

  // Readings & Telemetry
  getReadingsHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/readings/history?${query}`);
  },
  getMotorReadings: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/motors/${id}/readings?${query}`);
  },
  getLiveReading: (motorId) => request(`/readings/live/${motorId}`),
  getMotorStats: (motorId, range = '24h') => request(`/readings/stats/${motorId}?range=${range}`),
  getMachineStats: (motorId, range = '24h') => request(`/readings/stats/${motorId}?range=${range}`),

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/alerts?${query}`);
  },
  acknowledgeAlert: (id) => request(`/alerts/${id}/acknowledge`, { method: 'PATCH' }),
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: 'PATCH' }),

  // Maintenance
  getMaintenance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/maintenance?${query}`);
  },
  createMaintenance: (data) => request('/maintenance', { method: 'POST', body: data }),
  updateMaintenance: (id, data) => request(`/maintenance/${id}`, { method: 'PUT', body: data }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),

  // Dashboard Stats & Activity
  getDashboardStats: () => request('/dashboard/stats'),
  getActivityLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activity?${query}`);
  },

  // Analytics
  getAnalyticsOverview: () => request('/analytics/overview'),
  getAnalyticsTrends: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/analytics/trends?${query}`);
  },

  // Settings & Thresholds
  getThresholds: (motorId) => request(`/settings/thresholds${motorId ? `?motor_id=${motorId}` : ''}`),
  updateThresholds: (data) => request('/settings/thresholds', { method: 'PUT', body: data }),

  // Simulator & Anomaly Testing
  getSimulatorStatus: () => request('/simulator/status'),
  toggleSimulator: () => request('/simulator/toggle', { method: 'POST' }),
  injectFault: (motorId, faultType) =>
    request('/simulator/inject-fault', {
      method: 'POST',
      body: { machine_id: motorId, motor_id: motorId, fault_type: faultType },
    }),
};
