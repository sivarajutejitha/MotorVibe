/**
 * Alerts & Fault Diagnostics Controller
 * Manages rule-based predictive maintenance alarms and acknowledgements.
 */
const { query } = require('../config/db');

/**
 * List alerts with optional filters
 * GET /api/alerts?motor_id=1&status=Active&severity=Critical
 */
async function getAlerts(req, res, next) {
  try {
    const motorId = req.query.motor_id || req.query.machine_id;
    const { status, severity, limit = 100 } = req.query;

    let sql = `
      SELECT 
        a.id,
        a.motor_id,
        a.motor_id as machine_id,
        a.alert_type,
        a.severity,
        a.measured_value,
        a.measured_value as reading_value,
        a.threshold_value,
        a.message,
        a.status,
        a.created_at,
        a.acknowledged_at,
        a.acknowledged_by,
        m.equipment_code,
        m.equipment_code as machine_code,
        m.motor_name,
        m.motor_name as machine_name,
        m.location as machine_location
      FROM alerts a
      JOIN motors m ON a.motor_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (motorId) {
      params.push(motorId);
      sql += ` AND a.motor_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND LOWER(a.status) = LOWER($${params.length})`;
    }

    if (severity) {
      params.push(severity);
      sql += ` AND LOWER(a.severity) = LOWER($${params.length})`;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));

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
 * Acknowledge an alert
 * PATCH /api/alerts/:id/acknowledge
 * Also supports POST
 */
async function acknowledgeAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userName = req.user ? req.user.full_name || req.user.name : (req.body.acknowledged_by || 'Plant Operator');

    const updateRes = await query(
      `UPDATE alerts
       SET status = 'Acknowledged',
           acknowledged_at = CURRENT_TIMESTAMP,
           acknowledged_by = $1
       WHERE id = $2
       RETURNING *`,
      [userName, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const updated = updateRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('ALERT_ACKNOWLEDGED', $1)`,
      [`Alert #${updated.id} (${updated.alert_type} on Motor #${updated.motor_id}) acknowledged by ${userName}.`]
    );

    // Notify connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_acknowledged', updated);
    }

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resolve an alert
 * PATCH /api/alerts/:id/resolve
 * Also supports POST
 */
async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userName = req.user ? req.user.full_name || req.user.name : (req.body.resolved_by || 'Plant Engineer');

    const updateRes = await query(
      `UPDATE alerts
       SET status = 'Resolved'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const updated = updateRes.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, description)
       VALUES ('ALERT_RESOLVED', $1)`,
      [`Alert #${updated.id} resolved by ${userName}.`]
    );

    // Notify connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_resolved', updated);
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
};
