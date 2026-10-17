const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

router.get('/', async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const result = await query(
      `SELECT a.id, a.user_id, a.action, a.description, a.created_at, u.full_name, u.email
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [parseInt(limit, 10)]
    );
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
