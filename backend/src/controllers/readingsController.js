/**
 * Sensor Telemetry & History Controller
 * Supports rolling 60-second live window, 1-hour, 24-hour, and 7-day historical telemetry.
 */
const { query } = require('../config/db');
const { getLatestReading, getAllLatestReadings } = require('../services/simulator');

/**
 * Get historical sensor readings
 * GET /api/readings/history?motor_id=1&range=24h&limit=100
 */
async function getReadingsHistory(req, res, next) {
  try {
    const motorId = req.query.motor_id || req.query.machine_id;
    const { range = '24h', limit = 120 } = req.query;

    let intervalStr = '24 hours';
    if (range === '60s') intervalStr = '60 seconds';
    else if (range === '1h') intervalStr = '1 hour';
    else if (range === '24h') intervalStr = '24 hours';
    else if (range === '7d') intervalStr = '7 days';

    let sql = `
      SELECT 
        sr.id,
        sr.motor_id,
        sr.motor_id as machine_id,
        sr.vibration_x,
        sr.vibration_y,
        sr.vibration_z,
        sr.vibration_x as vib_x,
        sr.vibration_y as vib_y,
        sr.vibration_z as vib_z,
        sr.vibration_rms,
        sr.vibration_rms as vib_rms,
        sr.vibration_frequency_hz,
        sr.vibration_frequency_hz as frequency_peak,
        sr.temperature_c,
        sr.temperature_c as temperature,
        sr.current_a,
        sr.current_a as current,
        sr.runtime_hours,
        sr.recorded_at,
        sr.data_source,
        m.equipment_code,
        m.motor_name
      FROM sensor_readings sr
      JOIN motors m ON sr.motor_id = m.id
      WHERE sr.recorded_at >= NOW() - INTERVAL '${intervalStr}'
    `;
    const params = [];

    if (motorId) {
      params.push(motorId);
      sql += ` AND sr.motor_id = $${params.length}`;
    }

    sql += ` ORDER BY sr.recorded_at ASC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));

    const result = await query(sql, params);

    // Fallback if no stored rows in window
    if (result.rows.length === 0 && motorId) {
      const live = getLatestReading(motorId);
      return res.status(200).json({
        success: true,
        data: live ? [live] : [],
        count: live ? 1 : 0,
        range,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      range,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get readings for a specific motor
 * GET /api/motors/:id/readings
 */
async function getMotorReadings(req, res, next) {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const result = await query(
      `SELECT 
        sr.id,
        sr.motor_id,
        sr.vibration_x,
        sr.vibration_y,
        sr.vibration_z,
        sr.vibration_rms,
        sr.vibration_frequency_hz,
        sr.temperature_c,
        sr.current_a,
        sr.runtime_hours,
        sr.recorded_at,
        sr.data_source,
        sr.vibration_rms as vib_rms,
        sr.temperature_c as temperature,
        sr.current_a as current
       FROM sensor_readings sr
       WHERE sr.motor_id = $1
       ORDER BY sr.recorded_at DESC
       LIMIT $2`,
      [id, parseInt(limit, 10)]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get latest live reading for a specific motor
 * GET /api/readings/live/:motorId
 */
async function getLiveReadingByMotor(req, res, next) {
  try {
    const motorId = req.params.motorId || req.params.machineId;
    const reading = getLatestReading(motorId);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: `No active telemetry available for Motor ${motorId}.`,
      });
    }

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get statistical metrics (Min, Max, Avg) for a motor
 * GET /api/readings/stats/:motorId
 */
async function getMotorStats(req, res, next) {
  try {
    const motorId = req.params.motorId || req.params.machineId;
    const { range = '24h' } = req.query;

    let intervalStr = '24 hours';
    if (range === '1h') intervalStr = '1 hour';
    if (range === '7d') intervalStr = '7 days';

    const statsRes = await query(
      `SELECT 
         COUNT(*) as total_samples,
         ROUND(AVG(vibration_rms)::numeric, 2) as avg_vib_rms,
         ROUND(MAX(vibration_rms)::numeric, 2) as max_vib_rms,
         ROUND(MIN(vibration_rms)::numeric, 2) as min_vib_rms,
         ROUND(AVG(temperature_c)::numeric, 2) as avg_temperature,
         ROUND(MAX(temperature_c)::numeric, 2) as max_temperature,
         ROUND(MIN(temperature_c)::numeric, 2) as min_temperature,
         ROUND(AVG(current_a)::numeric, 2) as avg_current,
         ROUND(MAX(current_a)::numeric, 2) as max_current,
         ROUND(MIN(current_a)::numeric, 2) as min_current
       FROM sensor_readings
       WHERE motor_id = $1 AND recorded_at >= NOW() - INTERVAL '${intervalStr}'`,
      [motorId]
    );

    res.status(200).json({
      success: true,
      data: statsRes.rows[0],
      motor_id: parseInt(motorId, 10),
      range,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get virtual sensor channels configuration
 * GET /api/sensors
 */
async function getAllSensors(req, res, next) {
  try {
    const motorsRes = await query('SELECT id, equipment_code, motor_name FROM motors ORDER BY id ASC');
    const sensorsList = [];

    motorsRes.rows.forEach((m) => {
      sensorsList.push(
        {
          id: m.id * 10 + 1,
          motor_id: m.id,
          equipment_code: m.equipment_code,
          motor_name: m.motor_name,
          sensor_type: 'Vibration MPU6050',
          model: 'MPU-6050 3-Axis I2C Accelerometer',
          unit: 'mm/s RMS',
          min_threshold: 0.5,
          max_threshold: 4.5,
          status: 'ACTIVE',
        },
        {
          id: m.id * 10 + 2,
          motor_id: m.id,
          equipment_code: m.equipment_code,
          motor_name: m.motor_name,
          sensor_type: 'Temperature IR',
          model: 'MLX90614 Contactless Infrared Sensor',
          unit: '°C',
          min_threshold: 25.0,
          max_threshold: 70.0,
          status: 'ACTIVE',
        },
        {
          id: m.id * 10 + 3,
          motor_id: m.id,
          equipment_code: m.equipment_code,
          motor_name: m.motor_name,
          sensor_type: 'Current CT-Clamp',
          model: 'SCT-013-000 Non-Invasive 100A Sensor',
          unit: 'A',
          min_threshold: 1.0,
          max_threshold: 16.0,
          status: 'ACTIVE',
        }
      );
    });

    res.status(200).json({
      success: true,
      data: sensorsList,
      count: sensorsList.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single sensor by ID
 * GET /api/sensors/:id
 */
async function getSensorById(req, res, next) {
  try {
    const { id } = req.params;
    const motorId = Math.floor(id / 10);
    const mRes = await query('SELECT id, equipment_code, motor_name FROM motors WHERE id = $1', [motorId || 1]);
    const m = mRes.rows[0] || { id: 1, equipment_code: 'MTR-101', motor_name: 'Primary Slurry Feed Pump' };

    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id, 10),
        motor_id: m.id,
        equipment_code: m.equipment_code,
        motor_name: m.motor_name,
        sensor_type: 'Vibration MPU6050',
        model: 'MPU-6050 3-Axis I2C Accelerometer',
        unit: 'mm/s RMS',
        min_threshold: 0.5,
        max_threshold: 4.5,
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReadingsHistory,
  getMotorReadings,
  getLiveReadingByMotor,
  getMotorStats,
  getAllSensors,
  getSensorById,
};
