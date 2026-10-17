/**
 * Simulator & Anomaly Injection Controller
 * Allows triggering anomalies in real-time during live demonstrations.
 */
const { 
  getSimulatorStatus, 
  startSimulator, 
  stopSimulator, 
  setFault 
} = require('../services/simulator');

function getStatus(req, res) {
  res.status(200).json({
    success: true,
    data: getSimulatorStatus(),
  });
}

function toggleSimulator(req, res) {
  const status = getSimulatorStatus();
  const io = req.app.get('io');

  if (status.isRunning) {
    stopSimulator();
  } else {
    startSimulator(io);
  }

  res.status(200).json({
    success: true,
    message: !status.isRunning ? 'Simulator activated.' : 'Simulator paused.',
    isRunning: !status.isRunning,
  });
}

function injectFault(req, res) {
  const motorId = req.body.motor_id || req.body.machine_id;
  const faultType = req.body.fault_type;

  if (!motorId || !faultType) {
    return res.status(400).json({
      success: false,
      message: 'Both motor_id (or machine_id) and fault_type are required.',
    });
  }

  setFault(Number(motorId), faultType);

  res.status(200).json({
    success: true,
    message: `Fault state "${faultType}" injected into Motor #${motorId}. Watch live charts and alerts update.`,
  });
}

module.exports = {
  getStatus,
  toggleSimulator,
  injectFault,
};
