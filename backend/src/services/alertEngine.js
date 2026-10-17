/**
 * MotorVibe Explainable Fault Diagnostic & Alert Engine
 * Evaluates real-time telemetry against ISO 10816-3 standards and threshold parameters.
 */
const { query } = require('../config/db');

// In-memory cache for recent alerts to prevent flooding the database every second
const alertDebounceCache = new Map();

// Default industrial threshold limits (ISO 10816-3 Class II & III medium/large machines)
const DEFAULT_THRESHOLDS = {
  vib_warn_rms: 4.50, // mm/s - ISO Zone C
  vib_crit_rms: 7.10, // mm/s - ISO Zone D
  temp_warn_c: 70.00, // °C
  temp_crit_c: 85.00, // °C
  curr_warn_a: 14.00, // A
  curr_crit_a: 18.00, // A
};

/**
 * Calculate Explainable Health Index (0% to 100%) and sub-scores
 */
function calculateHealthIndex(reading, motor) {
  const rms = Number(reading.vibration_rms || reading.vib_rms) || 0;
  const temp = Number(reading.temperature_c || reading.temperature) || 0;
  const curr = Number(reading.current_a || reading.current) || 0;
  const ratedCurr = Number(motor?.rated_power_kw ? motor.rated_power_kw * 1.8 : 14.0);

  // 1. Vibration Health Score (45% weight)
  // 0 - 2.8 mm/s is 100%, 7.1 mm/s is 20%, >9 mm/s is 0%
  let vibScore = 100;
  if (rms > 2.8) {
    vibScore = Math.max(0, 100 - ((rms - 2.8) / (7.1 - 2.8)) * 80);
  }

  // 2. Thermal Health Score (30% weight)
  // <50°C is 100%, 70°C is 70%, 85°C is 20%, >95°C is 0%
  let tempScore = 100;
  if (temp > 50) {
    tempScore = Math.max(0, 100 - ((temp - 50) / (85 - 50)) * 80);
  }

  // 3. Electrical Health Score (25% weight)
  // <= rated current is 100%, 125% rated is 50%, >150% rated is 0%
  let currScore = 100;
  if (curr > ratedCurr) {
    currScore = Math.max(0, 100 - ((curr - ratedCurr) / (ratedCurr * 0.5)) * 100);
  }

  const overallScore = Math.round(vibScore * 0.45 + tempScore * 0.30 + currScore * 0.25);

  return {
    overall: Math.min(100, Math.max(5, overallScore)),
    vibration_score: Math.round(vibScore),
    thermal_score: Math.round(tempScore),
    electrical_score: Math.round(currScore),
    iso_zone:
      rms < 2.8
        ? 'Zone A (Good)'
        : rms < 4.5
        ? 'Zone B (Satisfactory)'
        : rms < 7.1
        ? 'Zone C (Alert / Warning)'
        : 'Zone D (Critical Danger)',
  };
}

/**
 * Evaluates an incoming reading and creates alerts if thresholds are breached
 */
async function processReading(reading, io) {
  try {
    const motorId = reading.motor_id || reading.machine_id;
    if (!motorId) return null;

    // Fetch motor details and thresholds
    const motorRes = await query('SELECT * FROM motors WHERE id = $1', [motorId]);
    if (motorRes.rows.length === 0) return null;
    const motor = motorRes.rows[0];

    const vibWarn = Number(motor.vibration_warning_threshold) || DEFAULT_THRESHOLDS.vib_warn_rms;
    const vibCrit = Number(motor.vibration_critical_threshold) || DEFAULT_THRESHOLDS.vib_crit_rms;
    const tempWarn = Number(motor.temperature_warning_threshold) || DEFAULT_THRESHOLDS.temp_warn_c;
    const tempCrit = Number(motor.temperature_critical_threshold) || DEFAULT_THRESHOLDS.temp_crit_c;
    const ratedCurr = Number(motor.rated_power_kw) * 1.8;
    const currWarn = ratedCurr * 1.1;
    const currCrit = ratedCurr * 1.35;

    const rms = Number(reading.vibration_rms || reading.vib_rms);
    const temp = Number(reading.temperature_c || reading.temperature);
    const curr = Number(reading.current_a || reading.current);

    const generatedAlerts = [];
    let highestSeverity = 'Healthy';

    // 1. Evaluate Vibration
    if (rms >= vibCrit) {
      highestSeverity = 'Critical';
      generatedAlerts.push({
        type: 'VIBRATION_CRITICAL',
        severity: 'Critical',
        reading: rms,
        threshold: vibCrit,
        message: `Vibration RMS (${rms.toFixed(2)} mm/s) exceeded ISO 10816 Zone D critical threshold (${vibCrit.toFixed(2)} mm/s). Severe mechanical hazard detected on ${motor.equipment_code}.`,
      });
    } else if (rms >= vibWarn) {
      if (highestSeverity !== 'Critical') highestSeverity = 'Warning';
      generatedAlerts.push({
        type: 'VIBRATION_WARNING',
        severity: 'Warning',
        reading: rms,
        threshold: vibWarn,
        message: `Vibration RMS (${rms.toFixed(2)} mm/s) entered ISO 10816 Zone C warning band (${vibWarn.toFixed(2)} mm/s). Bearing wear or unbalance developing.`,
      });
    }

    // 2. Evaluate Temperature
    if (temp >= tempCrit) {
      highestSeverity = 'Critical';
      generatedAlerts.push({
        type: 'TEMPERATURE_CRITICAL',
        severity: 'Critical',
        reading: temp,
        threshold: tempCrit,
        message: `Motor casing/bearing temperature (${temp.toFixed(1)}°C) exceeded Class F insulation critical limit (${tempCrit.toFixed(1)}°C). Immediate cooldown required.`,
      });
    } else if (temp >= tempWarn) {
      if (highestSeverity !== 'Critical') highestSeverity = 'Warning';
      generatedAlerts.push({
        type: 'TEMPERATURE_WARNING',
        severity: 'Warning',
        reading: temp,
        threshold: tempWarn,
        message: `Bearing housing thermal gradient reached (${temp.toFixed(1)}°C), exceeding ${tempWarn.toFixed(1)}°C warning threshold.`,
      });
    }

    // 3. Evaluate Electrical Current
    if (curr >= currCrit) {
      highestSeverity = 'Critical';
      generatedAlerts.push({
        type: 'CURRENT_CRITICAL',
        severity: 'Critical',
        reading: curr,
        threshold: currCrit,
        message: `Electrical current consumption (${curr.toFixed(1)}A) exceeded 135% rated full load capacity (${currCrit.toFixed(1)}A). Motor stalling or heavy mechanical jam.`,
      });
    } else if (curr >= currWarn) {
      if (highestSeverity !== 'Critical') highestSeverity = 'Warning';
      generatedAlerts.push({
        type: 'CURRENT_WARNING',
        severity: 'Warning',
        reading: curr,
        threshold: currWarn,
        message: `Current draw (${curr.toFixed(1)}A) running above 110% of rated capacity. Check mechanical load.`,
      });
    }

    // Update motor operational_status if changed
    if (motor.operational_status !== highestSeverity) {
      await query('UPDATE motors SET operational_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        highestSeverity,
        motorId,
      ]);
    }

    // Persist new alerts in PostgreSQL with 5-minute debouncing per alert type
    for (const alt of generatedAlerts) {
      const debounceKey = `${motorId}_${alt.type}`;
      const lastTriggered = alertDebounceCache.get(debounceKey);
      const now = Date.now();

      // Debounce window: 5 minutes (300,000 ms)
      if (!lastTriggered || now - lastTriggered > 300000) {
        alertDebounceCache.set(debounceKey, now);

        const insertRes = await query(
          `INSERT INTO alerts (motor_id, alert_type, severity, measured_value, threshold_value, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Active')
           RETURNING *`,
          [motorId, alt.type, alt.severity, alt.reading, alt.threshold, alt.message]
        );

        const savedAlert = {
          ...insertRes.rows[0],
          machine_id: motorId,
          machine_code: motor.equipment_code,
          machine_name: motor.motor_name,
        };

        // Broadcast alert event in real time via Socket.IO
        if (io) {
          io.emit('new_alert', savedAlert);
          io.to(`motor_${motorId}`).emit('motor_alert', savedAlert);
        }
      }
    }

    return {
      motorId,
      operational_status: highestSeverity,
      alertsGenerated: generatedAlerts.length,
    };
  } catch (error) {
    console.error('[Alert Engine Processing Error]:', error.message);
    return null;
  }
}

module.exports = {
  calculateHealthIndex,
  processReading,
  DEFAULT_THRESHOLDS,
};
