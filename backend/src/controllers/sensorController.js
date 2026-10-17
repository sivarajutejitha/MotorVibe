/**
 * Sensor CRUD Controller
 * Manages sensor hardware definitions attached to machines.
 * Mandatory Routes:
 *   GET    /api/sensors
 *   GET    /api/sensors/:id
 *   POST   /api/sensors
 *   PUT    /api/sensors/:id
 *   DELETE /api/sensors/:id
 * Course Outcome: CO-4, CO-6
 */
const { query } = require('../config/db');

/**
 * List all sensors across machines
 * GET /api/sensors
 */
async function getAllSensors(req, res, next) {
  try {
    const { machine_id } = req.query;

    let sql = `
      SELECT s.*, m.machine_code, m.name as machine_name
      FROM sensors s
      JOIN machines m ON s.machine_id = m.id
    `;
    const params = [];

    if (machine_id) {
      sql += ' WHERE s.machine_id = $1';
      params.push(machine_id);
    }

    sql += ' ORDER BY s.machine_id ASC, s.id ASC';

    const result = await query(sql, params);
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get sensor by ID
 * GET /api/sensors/:id
 */
async function getSensorById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT s.*, m.machine_code, m.name as machine_name
       FROM sensors s
       JOIN machines m ON s.machine_id = m.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Sensor with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new sensor
 * POST /api/sensors
 */
async function createSensor(req, res, next) {
  try {
    const { machine_id, sensor_type, model, unit, min_threshold, max_threshold, status } = req.body;

    if (!machine_id || !sensor_type || !model || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: machine_id, sensor_type, model, unit.',
      });
    }

    // Verify machine exists
    const mCheck = await query('SELECT id FROM machines WHERE id = $1', [machine_id]);
    if (mCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Machine with ID ${machine_id} does not exist.`,
      });
    }

    const insertRes = await query(
      `INSERT INTO sensors (machine_id, sensor_type, model, unit, min_threshold, max_threshold, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        machine_id,
        sensor_type.trim(),
        model.trim(),
        unit.trim(),
        min_threshold ? parseFloat(min_threshold) : null,
        max_threshold ? parseFloat(max_threshold) : null,
        status || 'ACTIVE',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Sensor configured successfully.',
      data: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update sensor by ID
 * PUT /api/sensors/:id
 */
async function updateSensor(req, res, next) {
  try {
    const { id } = req.params;
    const { sensor_type, model, unit, min_threshold, max_threshold, status } = req.body;

    const updateRes = await query(
      `UPDATE sensors
       SET sensor_type = COALESCE($1, sensor_type),
           model = COALESCE($2, model),
           unit = COALESCE($3, unit),
           min_threshold = COALESCE($4, min_threshold),
           max_threshold = COALESCE($5, max_threshold),
           status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [
        sensor_type,
        model,
        unit,
        min_threshold !== undefined ? parseFloat(min_threshold) : null,
        max_threshold !== undefined ? parseFloat(max_threshold) : null,
        status,
        id,
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Sensor with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sensor updated successfully.',
      data: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete sensor by ID
 * DELETE /api/sensors/:id
 */
async function deleteSensor(req, res, next) {
  try {
    const { id } = req.params;

    const delRes = await query('DELETE FROM sensors WHERE id = $1 RETURNING id, sensor_type', [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Sensor with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Sensor ${delRes.rows[0].sensor_type} (ID: ${id}) removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSensors,
  getSensorById,
  createSensor,
  updateSensor,
  deleteSensor,
};
