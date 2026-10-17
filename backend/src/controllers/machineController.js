/**
 * Machine Management Controller
 * Handles industrial motor assets, specifications, and live fleet status.
 * Course Outcome: CO-4, CO-6
 */
const { query } = require('../config/db');
const { getLatestReading } = require('../services/simulator');

/**
 * Get all machines with their live status, health index, and active alert counts
 * GET /api/machines
 */
async function getAllMachines(req, res, next) {
  try {
    const machinesRes = await query('SELECT * FROM machines ORDER BY id ASC');
    const machines = machinesRes.rows;

    // Attach latest live sensor reading, calculated health, and active alert count
    const enrichedMachines = await Promise.all(
      machines.map(async (m) => {
        const liveReading = getLatestReading(m.id);

        const alertCountRes = await query(
          "SELECT COUNT(*) as count FROM alerts WHERE machine_id = $1 AND status = 'ACTIVE'",
          [m.id]
        );

        return {
          ...m,
          live: liveReading,
          health_score: liveReading?.health?.overall ?? 85,
          active_alerts_count: parseInt(alertCountRes.rows[0].count, 10),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedMachines,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get machine details by ID
 * GET /api/machines/:id
 */
async function getMachineById(req, res, next) {
  try {
    const { id } = req.params;

    const machineRes = await query('SELECT * FROM machines WHERE id = $1', [id]);
    if (machineRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Machine with ID ${id} not found.`,
      });
    }

    const machine = machineRes.rows[0];

    // Fetch attached sensors
    const sensorsRes = await query('SELECT * FROM sensors WHERE machine_id = $1 ORDER BY id ASC', [id]);

    // Fetch custom thresholds
    const threshRes = await query('SELECT * FROM threshold_settings WHERE machine_id = $1', [id]);

    // Fetch active alerts
    const alertsRes = await query(
      "SELECT * FROM alerts WHERE machine_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC",
      [id]
    );

    // Fetch recent maintenance history
    const maintRes = await query(
      'SELECT * FROM maintenance_records WHERE machine_id = $1 ORDER BY recorded_at DESC LIMIT 5',
      [id]
    );

    const live = getLatestReading(id);

    res.status(200).json({
      success: true,
      data: {
        ...machine,
        sensors: sensorsRes.rows,
        thresholds: threshRes.rows[0] || null,
        active_alerts: alertsRes.rows,
        maintenance_records: maintRes.rows,
        live,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new industrial machine asset
 * POST /api/machines
 */
async function createMachine(req, res, next) {
  try {
    const { machine_code, name, type, location, rated_power_kw, rated_rpm, rated_voltage_v, rated_current_a } = req.body;

    if (!machine_code || !name || !type || !location || !rated_power_kw || !rated_rpm) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: machine_code, name, type, location, rated_power_kw, rated_rpm.',
      });
    }

    const insertRes = await query(
      `INSERT INTO machines (machine_code, name, type, location, rated_power_kw, rated_rpm, rated_voltage_v, rated_current_a, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'HEALTHY')
       RETURNING *`,
      [
        machine_code.toUpperCase().trim(),
        name.trim(),
        type.trim(),
        location.trim(),
        parseFloat(rated_power_kw),
        parseInt(rated_rpm, 10),
        parseInt(rated_voltage_v || 415, 10),
        parseFloat(rated_current_a || 14.0),
      ]
    );

    const created = insertRes.rows[0];

    // Create default sensors for the machine
    await query(
      `INSERT INTO sensors (machine_id, sensor_type, model, unit, min_threshold, max_threshold) VALUES
       ($1, 'Vibration MPU6050', 'MPU-6050 3-Axis', 'mm/s', 0.5, 4.5),
       ($1, 'Current CT-Clamp', 'SCT-013-000 100A', 'A', 1.0, $2),
       ($1, 'Temperature IR', 'MLX90614 Contactless', '°C', 25.0, 70.0)`,
      [created.id, parseFloat(rated_current_a || 14.0) * 1.1]
    );

    res.status(201).json({
      success: true,
      message: `Machine ${created.machine_code} added successfully.`,
      data: created,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A machine with this machine code already exists.',
      });
    }
    next(error);
  }
}

/**
 * Update machine details
 * PUT /api/machines/:id
 */
async function updateMachine(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, location, rated_power_kw, rated_rpm, rated_voltage_v, rated_current_a, status } = req.body;

    const updateRes = await query(
      `UPDATE machines 
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           location = COALESCE($3, location),
           rated_power_kw = COALESCE($4, rated_power_kw),
           rated_rpm = COALESCE($5, rated_rpm),
           rated_voltage_v = COALESCE($6, rated_voltage_v),
           rated_current_a = COALESCE($7, rated_current_a),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, type, location, rated_power_kw, rated_rpm, rated_voltage_v, rated_current_a, status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Machine not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Machine updated successfully.',
      data: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete machine asset
 * DELETE /api/machines/:id
 */
async function deleteMachine(req, res, next) {
  try {
    const { id } = req.params;
    const delRes = await query('DELETE FROM machines WHERE id = $1 RETURNING machine_code', [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Machine not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Machine ${delRes.rows[0].machine_code} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
};
