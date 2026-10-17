/**
 * Settings & Configurable Thresholds Controller
 * Allows engineers to adapt alarm levels according to motor class & power ratings.
 */
const { query } = require('../config/db');
const { DEFAULT_THRESHOLDS } = require('../services/alertEngine');
const { getMqttStatus } = require('../config/mqtt');
const { getSimulatorStatus } = require('../services/simulator');

/**
 * Get threshold limits for motors
 * GET /api/settings/thresholds
 */
async function getThresholds(req, res, next) {
  try {
    const motorId = req.query.motor_id || req.query.machine_id;

    let sql = `
      SELECT 
        id as motor_id,
        id as machine_id,
        equipment_code,
        motor_name,
        vibration_warning_threshold,
        vibration_critical_threshold,
        temperature_warning_threshold,
        temperature_critical_threshold,
        vibration_warning_threshold as vib_warn_rms,
        vibration_critical_threshold as vib_crit_rms,
        temperature_warning_threshold as temp_warn_c,
        temperature_critical_threshold as temp_crit_c
      FROM motors
    `;
    const params = [];

    if (motorId) {
      sql += ' WHERE id = $1';
      params.push(motorId);
    } else {
      sql += ' ORDER BY id ASC';
    }

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      defaults: DEFAULT_THRESHOLDS,
      data: result.rows,
      mqtt: getMqttStatus(),
      simulator: getSimulatorStatus(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update threshold limits on a motor
 * PUT /api/settings/thresholds
 */
async function updateThresholds(req, res, next) {
  try {
    const {
      motor_id,
      machine_id,
      vibration_warning_threshold,
      vibration_critical_threshold,
      temperature_warning_threshold,
      temperature_critical_threshold,
      vib_warn_rms,
      vib_crit_rms,
      temp_warn_c,
      temp_crit_c,
    } = req.body;

    const targetMotor = motor_id || machine_id;
    const finalVibWarn = vibration_warning_threshold || vib_warn_rms;
    const finalVibCrit = vibration_critical_threshold || vib_crit_rms;
    const finalTempWarn = temperature_warning_threshold || temp_warn_c;
    const finalTempCrit = temperature_critical_threshold || temp_crit_c;

    if (!targetMotor) {
      return res.status(400).json({ success: false, message: 'motor_id is required.' });
    }

    const updateRes = await query(
      `UPDATE motors
       SET vibration_warning_threshold = COALESCE($1, vibration_warning_threshold),
           vibration_critical_threshold = COALESCE($2, vibration_critical_threshold),
           temperature_warning_threshold = COALESCE($3, temperature_warning_threshold),
           temperature_critical_threshold = COALESCE($4, temperature_critical_threshold),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [finalVibWarn, finalVibCrit, finalTempWarn, finalTempCrit, targetMotor]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Motor not found.' });
    }

    const updated = updateRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('THRESHOLD_UPDATED', $1)`,
      [`Updated safety thresholds for Motor ${updated.equipment_code}.`]
    );

    res.status(200).json({
      success: true,
      message: 'Threshold configuration updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getThresholds,
  updateThresholds,
};
