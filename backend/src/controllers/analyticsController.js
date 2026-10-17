/**
 * Analytics Controller
 * Provides aggregated analytics, trends over time, runtime comparisons, and health distributions.
 */
const { query } = require('../config/db');

/**
 * Get Analytics Overview
 * GET /api/analytics/overview
 */
async function getAnalyticsOverview(req, res, next) {
  try {
    // 1. Health distribution
    const healthDistRes = await query(`
      SELECT 
        operational_status,
        COUNT(*) as count
      FROM motors
      GROUP BY operational_status
    `);

    // 2. Alert counts by severity
    const alertSeverityRes = await query(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM alerts
      GROUP BY severity
    `);

    // 3. Maintenance type summary
    const maintSummaryRes = await query(`
      SELECT 
        maintenance_type,
        COUNT(*) as count
      FROM maintenance_records
      GROUP BY maintenance_type
    `);

    // 4. Motor runtime and vibration comparison across motors
    const motorComparisonRes = await query(`
      SELECT 
        m.id,
        m.equipment_code,
        m.motor_name,
        m.rated_power_kw,
        m.operational_status,
        COALESCE(MAX(sr.runtime_hours), 0) as runtime_hours,
        COALESCE(ROUND(AVG(sr.vibration_rms)::numeric, 2), 2.2) as avg_vibration,
        COALESCE(ROUND(AVG(sr.temperature_c)::numeric, 2), 52.0) as avg_temperature,
        COALESCE(ROUND(AVG(sr.current_a)::numeric, 2), 9.0) as avg_current
      FROM motors m
      LEFT JOIN sensor_readings sr ON m.id = sr.motor_id
      GROUP BY m.id, m.equipment_code, m.motor_name, m.rated_power_kw, m.operational_status
      ORDER BY m.id ASC
    `);

    res.status(200).json({
      success: true,
      data: {
        health_distribution: healthDistRes.rows,
        alert_severity: alertSeverityRes.rows,
        maintenance_summary: maintSummaryRes.rows,
        motor_comparison: motorComparisonRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Analytics Time-Series Trends
 * GET /api/analytics/trends?motor_id=1&range=24h
 */
async function getAnalyticsTrends(req, res, next) {
  try {
    const motorId = req.query.motor_id || req.query.machine_id;
    const { range = '24h' } = req.query;

    let intervalStr = '24 hours';
    if (range === '1h') intervalStr = '1 hour';
    else if (range === '24h') intervalStr = '24 hours';
    else if (range === '7d') intervalStr = '7 days';

    let sql = `
      SELECT 
        sr.id,
        sr.motor_id,
        sr.vibration_rms,
        sr.vibration_rms as vib_rms,
        sr.temperature_c,
        sr.temperature_c as temperature,
        sr.current_a,
        sr.current_a as current,
        sr.vibration_frequency_hz,
        sr.vibration_frequency_hz as frequency_peak,
        sr.recorded_at,
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

    sql += ' ORDER BY sr.recorded_at ASC LIMIT 200';

    const trendsRes = await query(sql, params);

    res.status(200).json({
      success: true,
      data: trendsRes.rows,
      range,
      count: trendsRes.rows.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalyticsOverview,
  getAnalyticsTrends,
};
