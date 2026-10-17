/**
 * MotorVibe High-Fidelity Industrial Sensor Simulator
 * Generates realistic 3-axis vibration, RMS, temperature, current, and FFT frequency data.
 * Includes Fault Injection for live viva demonstrations and capstone project reviews.
 */
const { query } = require('../config/db');
const { processReading, calculateHealthIndex } = require('./alertEngine');

let simulatorInterval = null;
let isRunning = false;
let tickCount = 0;

// Motor active fault states (can be modified at runtime via API)
const motorFaults = {
  1: 'NORMAL',
  2: 'ELEVATED_TEMP',
  3: 'NORMAL',
  4: 'BEARING_FAULT',
  5: 'NORMAL',
  6: 'CAVITATION_WARNING',
};

// Motor baseline parameters across 6 industrial assets
const MOTOR_SPECS = {
  1: { code: 'MTR-101', name: 'Primary Slurry Feed Pump', baseVib: 2.2, baseTemp: 52.0, baseCurr: 9.4, freq: 50.0, runtime: 3445.0 },
  2: { code: 'MTR-102', name: 'Secondary Ventilation Blower', baseVib: 4.8, baseTemp: 74.2, baseCurr: 9.1, freq: 98.4, runtime: 2834.0 },
  3: { code: 'MTR-103', name: 'Rotary Screw Air Compressor', baseVib: 2.9, baseTemp: 64.5, baseCurr: 13.8, freq: 25.0, runtime: 4144.0 },
  4: { code: 'MTR-104', name: 'Heavy Ore Conveyor Drive', baseVib: 7.8, baseTemp: 69.8, baseCurr: 8.6, freq: 16.4, runtime: 1974.0 },
  5: { code: 'MTR-105', name: 'CNC High-Precision Spindle', baseVib: 1.4, baseTemp: 41.5, baseCurr: 6.2, freq: 120.0, runtime: 914.0 },
  6: { code: 'MTR-106', name: 'Chilled Water Circulation Pump', baseVib: 5.2, baseTemp: 68.5, baseCurr: 12.2, freq: 49.5, runtime: 5124.0 },
};

// Cache latest readings in memory for instant API queries
const latestReadingsCache = new Map();

/**
 * Generate simulated Gaussian noise using Box-Muller transform
 */
function randomGaussian(mean = 0, stdev = 0.1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdev;
}

/**
 * Generate 24-bin FFT frequency spectrum data (5Hz to 120Hz)
 */
function generateFrequencySpectrum(dominantFreq, rms) {
  const bins = [];
  const freqSteps = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

  for (const f of freqSteps) {
    let amplitude = 0.15 + Math.random() * 0.2;

    // Fundamental 1X running frequency peak
    if (Math.abs(f - dominantFreq) <= 5) {
      amplitude += (rms * 0.45) + (Math.random() * 0.3);
    }
    // 2X harmonic (misalignment)
    else if (Math.abs(f - (dominantFreq * 2)) <= 5) {
      amplitude += (rms * 0.25) + (Math.random() * 0.2);
    }
    // 3X harmonic (looseness)
    else if (Math.abs(f - (dominantFreq * 3)) <= 5) {
      amplitude += (rms * 0.15) + (Math.random() * 0.15);
    }

    bins.push({
      frequency: f,
      amplitude: parseFloat(amplitude.toFixed(2)),
    });
  }

  return bins;
}

/**
 * Generate telemetry snapshot for a specific motor ID
 */
function generateReading(motorId) {
  const spec = MOTOR_SPECS[motorId] || MOTOR_SPECS[1];
  const fault = motorFaults[motorId] || 'NORMAL';
  const t = tickCount * 0.2;

  let vibBase = spec.baseVib;
  let tempBase = spec.baseTemp;
  let currBase = spec.baseCurr;
  let dominantFreq = spec.freq;

  // Apply fault adjustments
  if (fault === 'BEARING_FAULT') {
    vibBase = 8.2;
    dominantFreq = 115.0; // High-frequency defect peak
  } else if (fault === 'UNBALANCE') {
    vibBase = 6.4;
    dominantFreq = spec.freq; // 1X peak
  } else if (fault === 'THERMAL_OVERLOAD') {
    tempBase = 89.5;
    currBase = spec.baseCurr * 1.25;
  } else if (fault === 'CURRENT_SURGE') {
    currBase = spec.baseCurr * 1.6;
  } else if (fault === 'ELEVATED_TEMP') {
    tempBase = 74.8;
  } else if (fault === 'CAVITATION_WARNING') {
    vibBase = 5.25;
  }

  // Realistic oscillation plus noise
  const vib_rms = parseFloat(
    Math.max(0.2, vibBase + Math.sin(t * 0.5) * 0.25 + randomGaussian(0, 0.08)).toFixed(2)
  );

  const vib_x = parseFloat((vib_rms * 0.21 + randomGaussian(0, 0.03)).toFixed(3));
  const vib_y = parseFloat((vib_rms * 0.24 + randomGaussian(0, 0.04)).toFixed(3));
  const vib_z = parseFloat((vib_rms * 0.18 + randomGaussian(0, 0.02)).toFixed(3));

  const temperature_c = parseFloat(
    (tempBase + Math.sin(t * 0.1) * 0.8 + randomGaussian(0, 0.2)).toFixed(1)
  );

  const current_a = parseFloat(
    Math.max(0.5, currBase + Math.sin(t * 0.3) * 0.3 + randomGaussian(0, 0.1)).toFixed(1)
  );

  const frequency_peak = parseFloat(
    (dominantFreq + randomGaussian(0, 0.15)).toFixed(1)
  );

  const spectrum = generateFrequencySpectrum(frequency_peak, vib_rms);
  const runtime_hours = parseFloat((spec.runtime + (tickCount * 0.00028)).toFixed(2));

  const reading = {
    motor_id: Number(motorId),
    machine_id: Number(motorId),
    motor_name: spec.name,
    machine_name: spec.name,
    equipment_code: spec.code,
    machine_code: spec.code,
    vibration_x: vib_x,
    vibration_y: vib_y,
    vibration_z: vib_z,
    vibration_rms: vib_rms,
    vibration_frequency_hz: frequency_peak,
    temperature_c: temperature_c,
    current_a: current_a,
    runtime_hours: runtime_hours,
    // Compatibility fields
    vib_x,
    vib_y,
    vib_z,
    vib_rms,
    temperature: temperature_c,
    current: current_a,
    frequency_peak,
    spectrum,
    fault_state: fault,
    is_simulated: true,
    data_source: 'simulated',
    recorded_at: new Date().toISOString(),
  };

  // Compute explainable health score
  reading.health = calculateHealthIndex(reading, {
    rated_power_kw: spec.baseCurr / 1.8,
  });

  return reading;
}

/**
 * Start the Industrial Sensor Simulation Engine
 */
function startSimulator(io, intervalMs = 1000) {
  if (isRunning) return;

  isRunning = true;
  console.log(`[Simulator Engine Started]: Emitting 6-motor telemetry every ${intervalMs}ms`);

  simulatorInterval = setInterval(async () => {
    tickCount++;
    const motorIds = [1, 2, 3, 4, 5, 6];

    for (const motorId of motorIds) {
      try {
        const reading = generateReading(motorId);
        latestReadingsCache.set(motorId, reading);

        // Process alerts
        if (io) {
          await processReading(reading, io);

          // Broadcast live reading to Socket.IO clients
          io.emit('sensor_reading', reading);
          io.to(`motor_${motorId}`).emit('motor_telemetry', reading);
          io.to(`machine_${motorId}`).emit('machine_telemetry', reading);
        }

        // Sampling & Storage Interval: Store in PostgreSQL every 10 ticks (10s)
        // to avoid database bloating while maintaining rich historical trends
        if (tickCount % 10 === 0) {
          query(
            `INSERT INTO sensor_readings (
              motor_id,
              vibration_x,
              vibration_y,
              vibration_z,
              vibration_rms,
              vibration_frequency_hz,
              temperature_c,
              current_a,
              runtime_hours,
              data_source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'simulated')`,
            [
              motorId,
              reading.vibration_x,
              reading.vibration_y,
              reading.vibration_z,
              reading.vibration_rms,
              reading.vibration_frequency_hz,
              reading.temperature_c,
              reading.current_a,
              reading.runtime_hours,
            ]
          ).catch((e) => {
            // non-fatal telemetry persistence warning
          });
        }
      } catch (err) {
        console.error(`[Simulator Error for Motor ${motorId}]:`, err.message);
      }
    }
  }, intervalMs);
}

/**
 * Stop the simulator
 */
function stopSimulator() {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
  isRunning = false;
  console.log('[Simulator Engine Stopped]');
}

/**
 * Set fault state on a motor
 */
function setFault(motorId, faultType) {
  motorFaults[motorId] = faultType;
  return { motorId, fault: faultType };
}

/**
 * Get latest cached reading
 */
function getLatestReading(motorId) {
  const cached = latestReadingsCache.get(Number(motorId));
  if (cached) return cached;
  const fresh = generateReading(motorId);
  latestReadingsCache.set(Number(motorId), fresh);
  return fresh;
}

/**
 * Get all latest cached readings
 */
function getAllLatestReadings() {
  const motorIds = [1, 2, 3, 4, 5, 6];
  return motorIds.map((id) => getLatestReading(id));
}

/**
 * Status of simulator
 */
function getSimulatorStatus() {
  return {
    isRunning,
    intervalMs: 1000,
    activeFaults: motorFaults,
    monitoredMotors: [1, 2, 3, 4, 5, 6],
    samplingPolicy: 'In-memory 1Hz broadcast; PostgreSQL 10s sampled persistence',
  };
}

module.exports = {
  startSimulator,
  stopSimulator,
  setFault,
  getLatestReading,
  getAllLatestReadings,
  getSimulatorStatus,
  generateReading,
};
