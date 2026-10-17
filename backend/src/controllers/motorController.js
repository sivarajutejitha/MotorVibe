/**
 * Motor Management Controller
 * Handles industrial motor assets, thresholds, specifications, and fleet status.
 * Supports both /api/motors and legacy /api/machines endpoints.
 */
const { query } = require('../config/db');
const { getLatestReading } = require('../services/simulator');

/**
 * Get all motors with live status and alert counts
 * GET /api/motors
 */
async function getAllMotors(req, res, next) {
  try {
    const { status, search } = req.query;

    let sql = 'SELECT * FROM motors WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND LOWER(operational_status) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (motor_name ILIKE $${params.length} OR equipment_code ILIKE $${params.length} OR location ILIKE $${params.length})`;
    }

    sql += ' ORDER BY id ASC';

    const motorsRes = await query(sql, params);
    const motors = motorsRes.rows;

    // Attach latest live sensor reading, health score, and active alert count
    const enrichedMotors = await Promise.all(
      motors.map(async (m) => {
        const liveReading = getLatestReading(m.id);

        const alertCountRes = await query(
          "SELECT COUNT(*) as count FROM alerts WHERE motor_id = $1 AND status = 'Active'",
          [m.id]
        );

        return {
          ...m,
          // Compatibility aliases
          name: m.motor_name,
          machine_code: m.equipment_code,
          status: m.operational_status,
          type: '3-Phase Induction Motor',
          rated_rpm: 1480,
          rated_voltage_v: 415,
          rated_current_a: parseFloat((Number(m.rated_power_kw) * 1.8).toFixed(1)),
          live: liveReading,
          health_score: liveReading?.health?.overall ?? (m.operational_status === 'Healthy' ? 92 : m.operational_status === 'Warning' ? 68 : 42),
          active_alerts_count: parseInt(alertCountRes.rows[0].count, 10),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedMotors,
      count: enrichedMotors.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get motor details by ID
 * GET /api/motors/:id
 */
async function getMotorById(req, res, next) {
  try {
    const { id } = req.params;

    const motorRes = await query('SELECT * FROM motors WHERE id = $1', [id]);
    if (motorRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Motor with ID ${id} not found.`,
      });
    }

    const motor = motorRes.rows[0];

    // Fetch active alerts for this motor
    const alertsRes = await query(
      "SELECT * FROM alerts WHERE motor_id = $1 ORDER BY created_at DESC LIMIT 10",
      [id]
    );

    // Fetch recent maintenance history for this motor
    const maintRes = await query(
      'SELECT * FROM maintenance_records WHERE motor_id = $1 ORDER BY maintenance_date DESC LIMIT 10',
      [id]
    );

    // Fetch recent 30 sensor telemetry readings
    const readingsRes = await query(
      'SELECT * FROM sensor_readings WHERE motor_id = $1 ORDER BY recorded_at DESC LIMIT 30',
      [id]
    );

    const live = getLatestReading(id);

    res.status(200).json({
      success: true,
      data: {
        ...motor,
        name: motor.motor_name,
        machine_code: motor.equipment_code,
        status: motor.operational_status,
        type: '3-Phase Induction Motor',
        rated_rpm: 1480,
        rated_voltage_v: 415,
        rated_current_a: parseFloat((Number(motor.rated_power_kw) * 1.8).toFixed(1)),
        active_alerts: alertsRes.rows,
        maintenance_records: maintRes.rows,
        recent_readings: readingsRes.rows,
        live,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new motor asset
 * POST /api/motors
 */
async function createMotor(req, res, next) {
  try {
    const {
      motor_name,
      equipment_code,
      location,
      rated_power_kw,
      installation_date,
      vibration_warning_threshold,
      vibration_critical_threshold,
      temperature_warning_threshold,
      temperature_critical_threshold,
      operational_status,
      // Compatibility aliases
      name,
      machine_code,
    } = req.body;

    const finalName = motor_name || name;
    const finalCode = equipment_code || machine_code;

    if (!finalName || !finalCode || !location || !rated_power_kw) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: motor_name (or name), equipment_code (or machine_code), location, rated_power_kw.',
      });
    }

    const insertRes = await query(
      `INSERT INTO motors (
        motor_name,
        equipment_code,
        location,
        rated_power_kw,
        installation_date,
        vibration_warning_threshold,
        vibration_critical_threshold,
        temperature_warning_threshold,
        temperature_critical_threshold,
        operational_status
      ) VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6, $7, $8, $9, COALESCE($10, 'Healthy'))
      RETURNING *`,
      [
        finalName.trim(),
        finalCode.toUpperCase().trim(),
        location.trim(),
        parseFloat(rated_power_kw),
        installation_date || null,
        parseFloat(vibration_warning_threshold || 4.5),
        parseFloat(vibration_critical_threshold || 7.1),
        parseFloat(temperature_warning_threshold || 70.0),
        parseFloat(temperature_critical_threshold || 85.0),
        operational_status || 'Healthy',
      ]
    );

    const created = insertRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('MOTOR_REGISTERED', $1)`,
      [`Motor ${created.motor_name} (${created.equipment_code}) commissioned at ${created.location}.`]
    );

    res.status(201).json({
      success: true,
      message: `Motor ${created.equipment_code} registered successfully.`,
      data: {
        ...created,
        name: created.motor_name,
        machine_code: created.equipment_code,
        status: created.operational_status,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A motor with this equipment code already exists.',
      });
    }
    next(error);
  }
}

/**
 * Update motor details
 * PUT /api/motors/:id
 */
async function updateMotor(req, res, next) {
  try {
    const { id } = req.params;
    const {
      motor_name,
      equipment_code,
      location,
      rated_power_kw,
      installation_date,
      vibration_warning_threshold,
      vibration_critical_threshold,
      temperature_warning_threshold,
      temperature_critical_threshold,
      operational_status,
      name,
      machine_code,
      status,
    } = req.body;

    const finalName = motor_name || name;
    const finalCode = equipment_code || machine_code;
    const finalStatus = operational_status || status;

    const updateRes = await query(
      `UPDATE motors 
       SET motor_name = COALESCE($1, motor_name),
           equipment_code = COALESCE($2, equipment_code),
           location = COALESCE($3, location),
           rated_power_kw = COALESCE($4, rated_power_kw),
           installation_date = COALESCE($5, installation_date),
           vibration_warning_threshold = COALESCE($6, vibration_warning_threshold),
           vibration_critical_threshold = COALESCE($7, vibration_critical_threshold),
           temperature_warning_threshold = COALESCE($8, temperature_warning_threshold),
           temperature_critical_threshold = COALESCE($9, temperature_critical_threshold),
           operational_status = COALESCE($10, operational_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        finalName,
        finalCode ? finalCode.toUpperCase().trim() : null,
        location,
        rated_power_kw ? parseFloat(rated_power_kw) : null,
        installation_date,
        vibration_warning_threshold ? parseFloat(vibration_warning_threshold) : null,
        vibration_critical_threshold ? parseFloat(vibration_critical_threshold) : null,
        temperature_warning_threshold ? parseFloat(temperature_warning_threshold) : null,
        temperature_critical_threshold ? parseFloat(temperature_critical_threshold) : null,
        finalStatus,
        id,
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Motor not found.' });
    }

    const updated = updateRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('MOTOR_UPDATED', $1)`,
      [`Updated configuration for motor ${updated.equipment_code}.`]
    );

    res.status(200).json({
      success: true,
      message: 'Motor updated successfully.',
      data: {
        ...updated,
        name: updated.motor_name,
        machine_code: updated.equipment_code,
        status: updated.operational_status,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete motor asset
 * DELETE /api/motors/:id
 */
async function deleteMotor(req, res, next) {
  try {
    const { id } = req.params;
    const delRes = await query('DELETE FROM motors WHERE id = $1 RETURNING equipment_code, motor_name', [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Motor not found.' });
    }

    const deleted = delRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('MOTOR_DELETED', $1)`,
      [`Decommissioned motor ${deleted.equipment_code} (${deleted.motor_name}).`]
    );

    res.status(200).json({
      success: true,
      message: `Motor ${deleted.equipment_code} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllMotors,
  getMotorById,
  createMotor,
  updateMotor,
  deleteMotor,
};
