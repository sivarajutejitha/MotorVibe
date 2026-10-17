/**
 * MotorVibe Backend Integration & API Verification Suite
 * Tests all core REST endpoints against PostgreSQL
 */
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const status = res.status;
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status, data };
}

let testUserToken = '';
let testMotorId = null;

const tests = [
  {
    name: '1. Health Check Endpoint (GET /api/health)',
    fn: async () => {
      const { status, data } = await request('/health');
      if (status !== 200 || data.status !== 'ONLINE') {
        throw new Error(`Expected 200 & ONLINE, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '2. User Login Endpoint (POST /api/auth/login)',
    fn: async () => {
      const { status, data } = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'demo@motorvibe.io', password: 'Password123!' }),
      });
      if (status !== 200 || !data.token) {
        throw new Error(`Expected 200 & token, got ${status}: ${JSON.stringify(data)}`);
      }
      testUserToken = data.token;
    },
  },
  {
    name: '3. Current User Endpoint (GET /api/auth/me)',
    fn: async () => {
      const { status, data } = await request('/auth/me', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const user = data.user || data;
      if (status !== 200 || user.email !== 'demo@motorvibe.io') {
        throw new Error(`Expected 200 with user profile, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '4. Dashboard Overview (GET /api/dashboard/overview)',
    fn: async () => {
      const { status, data } = await request('/dashboard/overview', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      if (status !== 200 || !data.data || !data.data.fleet) {
        throw new Error(`Expected fleet stats, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '5. Motors List (GET /api/motors)',
    fn: async () => {
      const { status, data } = await request('/motors', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : null);
      if (status !== 200 || !list) {
        throw new Error(`Expected motors array, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '6. Single Motor Details (GET /api/motors/1)',
    fn: async () => {
      const { status, data } = await request('/motors/1', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const item = data.data || data;
      if (status !== 200 || !item || !item.id) {
        throw new Error(`Expected motor object with id=1, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '7. Motor Registration (POST /api/motors)',
    fn: async () => {
      const newMotor = {
        motor_name: 'Auto-Test Induction Motor',
        equipment_code: `MTR-TEST-${Date.now().toString().slice(-4)}`,
        location: 'Test Bay 9',
        rated_power_kw: 37.5,
        installation_date: '2026-03-01',
        vibration_warning_threshold: 4.5,
        vibration_critical_threshold: 7.1,
        temperature_warning_threshold: 75.0,
        temperature_critical_threshold: 90.0,
      };
      const { status, data } = await request('/motors', {
        method: 'POST',
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify(newMotor),
      });
      const item = data.data || data;
      if (status !== 201 || !item || !item.id) {
        throw new Error(`Expected 201 created, got ${status}: ${JSON.stringify(data)}`);
      }
      testMotorId = item.id;
    },
  },
  {
    name: '8. Motor Update (PUT /api/motors/:id)',
    fn: async () => {
      const updateData = {
        motor_name: 'Auto-Test Motor (Updated)',
        location: 'Test Bay 9B',
        rated_power_kw: 45.0,
      };
      const { status, data } = await request(`/motors/${testMotorId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify(updateData),
      });
      const item = data.data || data;
      if (status !== 200 || item.motor_name !== 'Auto-Test Motor (Updated)') {
        throw new Error(`Expected 200 updated name, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '9. Motor Deletion (DELETE /api/motors/:id)',
    fn: async () => {
      const { status } = await request(`/motors/${testMotorId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      if (status !== 200) {
        throw new Error(`Expected 200, got ${status}`);
      }
    },
  },
  {
    name: '10. Alerts List (GET /api/alerts)',
    fn: async () => {
      const { status, data } = await request('/alerts', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : null);
      if (status !== 200 || !list) {
        throw new Error(`Expected alerts list, got ${status}`);
      }
    },
  },
  {
    name: '11. Alert Acknowledgement (PATCH /api/alerts/1/acknowledge)',
    fn: async () => {
      const { status, data } = await request('/alerts/1/acknowledge', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify({ acknowledged_by: 'Test Automation' }),
      });
      if (status !== 200) {
        throw new Error(`Expected 200, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '12. Maintenance Records (GET /api/maintenance)',
    fn: async () => {
      const { status, data } = await request('/maintenance', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : null);
      if (status !== 200 || !list) {
        throw new Error(`Expected maintenance records, got ${status}`);
      }
    },
  },
  {
    name: '13. Create Maintenance Record (POST /api/maintenance)',
    fn: async () => {
      const log = {
        motor_id: 1,
        maintenance_type: 'PREVENTIVE',
        description: 'Vibration spectrum diagnostic and re-greasing',
        work_performed: 'Greased DE and NDE bearings with Mobil Polyrex EM',
        technician_name: 'Test Automation Technician',
      };
      const { status, data } = await request('/maintenance', {
        method: 'POST',
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify(log),
      });
      if (status !== 201) {
        throw new Error(`Expected 201, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
  {
    name: '14. Analytics Overview (GET /api/analytics/overview)',
    fn: async () => {
      const { status, data } = await request('/analytics/overview', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      if (status !== 200) {
        throw new Error(`Expected 200, got ${status}`);
      }
    },
  },
  {
    name: '15. System Activity Feed (GET /api/activity)',
    fn: async () => {
      const { status, data } = await request('/activity', {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : null);
      if (status !== 200 || !list) {
        throw new Error(`Expected activity array, got ${status}`);
      }
    },
  },
  {
    name: '16. Simulator Status & Toggle (GET /api/simulator/status)',
    fn: async () => {
      const { status, data } = await request('/simulator/status');
      const isRunning = data.data ? data.data.isRunning : data.isRunning;
      if (status !== 200 || typeof isRunning !== 'boolean') {
        throw new Error(`Expected 200 & isRunning boolean, got ${status}: ${JSON.stringify(data)}`);
      }
    },
  },
];

async function runSuite() {
  console.log('\n======================================================');
  console.log('  MotorVibe Backend REST API Integration Test Suite');
  console.log('  Target Base URL: ' + BASE_URL);
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  PASS: ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${t.name}`);
      console.error(`        Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`  TOTAL: ${tests.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Check if server is running, or start it
async function main() {
  try {
    await fetch(`${BASE_URL}/health`);
    // Already running! Run suite directly
    await runSuite();
  } catch (e) {
    console.log('Backend not currently running on port 5000. Launching in-process server for tests...');
    const serverModule = require('../src/server');
    // Wait 1.5 seconds for database & server to listen
    await new Promise((r) => setTimeout(r, 1500));
    try {
      await runSuite();
    } finally {
      if (serverModule && serverModule.server) {
        serverModule.server.close();
      }
    }
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
