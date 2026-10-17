/**
 * Maintenance History Controller
 * Manages technician servicing logs, bearing replacements, and lubrication records.
 * Full CRUD: GET, POST, PUT, DELETE
 */
const { query } = require('../config/db');

/**
 * Get all maintenance logs
 * GET /api/maintenance?motor_id=1
 */
async function getMaintenanceRecords(req, res, next) {
  try {
    const motorId = req.query.motor_id || req.query.machine_id;

    let sql = `
      SELECT 
        mr.id,
        mr.motor_id,
        mr.motor_id as machine_id,
        mr.maintenance_type,
        mr.description,
        mr.work_performed,
        mr.work_performed as action_taken,
        mr.technician_name,
        mr.maintenance_date,
        mr.maintenance_date as recorded_at,
        mr.next_maintenance_date,
        mr.status,
        mr.created_at,
        m.equipment_code,
        m.equipment_code as machine_code,
        m.motor_name,
        m.motor_name as machine_name,
        m.location as machine_location
      FROM maintenance_records mr
      JOIN motors m ON mr.motor_id = m.id
    `;
    const params = [];

    if (motorId) {
      sql += ' WHERE mr.motor_id = $1';
      params.push(motorId);
    }

    sql += ' ORDER BY mr.maintenance_date DESC, mr.id DESC';

    const result = await query(sql, params);

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
 * Log a new maintenance service action
 * POST /api/maintenance
 */
async function createMaintenanceRecord(req, res, next) {
  try {
    const {
      motor_id,
      machine_id,
      technician_name,
      maintenance_type,
      description,
      work_performed,
      action_taken,
      maintenance_date,
      next_maintenance_date,
      status,
    } = req.body;

    const finalMotorId = motor_id || machine_id;
    const finalWork = work_performed || action_taken;

    if (!finalMotorId || !technician_name || !maintenance_type || !description || !finalWork) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: motor_id, technician_name, maintenance_type, description, work_performed.',
      });
    }

    // Verify motor exists
    const mCheck = await query('SELECT id, equipment_code FROM motors WHERE id = $1', [finalMotorId]);
    if (mCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Motor does not exist.' });
    }

    const insertRes = await query(
      `INSERT INTO maintenance_records (
        motor_id,
        technician_name,
        maintenance_type,
        description,
        work_performed,
        maintenance_date,
        next_maintenance_date,
        status
      ) VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), $7, COALESCE($8, 'Completed'))
      RETURNING *`,
      [
        finalMotorId,
        technician_name.trim(),
        maintenance_type.trim(),
        description.trim(),
        finalWork.trim(),
        maintenance_date || null,
        next_maintenance_date || null,
        status || 'Completed',
      ]
    );

    const record = insertRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('MAINTENANCE_CREATED', $1)`,
      [`Logged ${record.maintenance_type} for Motor #${record.motor_id} by ${record.technician_name}.`]
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance record logged successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing maintenance record
 * PUT /api/maintenance/:id
 */
async function updateMaintenanceRecord(req, res, next) {
  try {
    const { id } = req.params;
    const {
      technician_name,
      maintenance_type,
      description,
      work_performed,
      maintenance_date,
      next_maintenance_date,
      status,
    } = req.body;

    const updateRes = await query(
      `UPDATE maintenance_records
       SET technician_name = COALESCE($1, technician_name),
           maintenance_type = COALESCE($2, maintenance_type),
           description = COALESCE($3, description),
           work_performed = COALESCE($4, work_performed),
           maintenance_date = COALESCE($5, maintenance_date),
           next_maintenance_date = COALESCE($6, next_maintenance_date),
           status = COALESCE($7, status)
       WHERE id = $8
       RETURNING *`,
      [technician_name, maintenance_type, description, work_performed, maintenance_date, next_maintenance_date, status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully.',
      data: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a maintenance record
 * DELETE /api/maintenance/:id
 */
async function deleteMaintenanceRecord(req, res, next) {
  try {
    const { id } = req.params;
    const delRes = await query('DELETE FROM maintenance_records WHERE id = $1 RETURNING id, motor_id', [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Maintenance record #${id} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
};
