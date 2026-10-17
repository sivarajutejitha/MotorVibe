const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getAnalyticsOverview);
router.get('/trends', analyticsController.getAnalyticsTrends);

module.exports = router;
