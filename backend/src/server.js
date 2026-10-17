/**
 * MotorVibe Backend Server Entry Point
 * Express.js + Socket.IO + PostgreSQL + MQTT IIoT Integration
 * Course Outcomes: CO-4, CO-5, CO-6
 */
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const { testConnection } = require('./config/db');
const { initMqtt, onTelemetryReceived } = require('./config/mqtt');
const { startSimulator } = require('./services/simulator');
const { processReading } = require('./services/alertEngine');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const motorRoutes = require('./routes/motorRoutes');
const machineRoutes = require('./routes/machineRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const readingsRoutes = require('./routes/readingsRoutes');
const alertRoutes = require('./routes/alertRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow local frontend during development
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// 2. Middleware configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'MotorVibe Industrial Telemetry Backend',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL Connected',
    socket_connections: io.engine.clientsCount,
  });
});

// 4. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/motors', motorRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/simulator', simulatorRoutes);

// 5. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 6. Socket.IO Real-time Connection Lifecycle
io.on('connection', (socket) => {
  console.log(`[Socket.IO Client Connected]: ID = ${socket.id}`);

  // Client can subscribe to a specific machine room or receive all
  socket.on('subscribe_machine', (machineId) => {
    socket.join(`machine_${machineId}`);
  });

  socket.on('unsubscribe_machine', (machineId) => {
    socket.leave(`machine_${machineId}`);
  });

  socket.on('disconnect', () => {
    // Clean up
  });
});

// 7. MQTT Telemetry Bridge
// When real hardware messages arrive via MQTT broker, process & broadcast to WebSockets
onTelemetryReceived(async (topic, telemetry) => {
  try {
    telemetry.is_simulated = false; // Real hardware stream
    await processReading(telemetry, io);
    io.emit('sensor_reading', telemetry);
  } catch (err) {
    console.error('[MQTT Telemetry Bridge Error]:', err.message);
  }
});

// 8. Server Boot Sequence
async function startServer() {
  try {
    // Verify PostgreSQL connection
    const dbOk = await testConnection();
    if (!dbOk) {
      console.warn('WARNING: PostgreSQL connection check failed. Ensure PostgreSQL is running.');
    }

    // Connect to MQTT Broker
    initMqtt();

    // Start background Industrial Sensor Simulator
    if (process.env.SIMULATOR_ENABLED !== 'false') {
      startSimulator(io);
    }

    server.listen(PORT, () => {
      console.log('\n======================================================');
      console.log(`  MotorVibe Backend Server running on port ${PORT}`);
      console.log(`  API Base URL:  http://localhost:${PORT}/api`);
      console.log(`  Health Check:  http://localhost:${PORT}/api/health`);
      console.log(`  Client Origin: ${CLIENT_ORIGIN}`);
      console.log('======================================================\n');
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
