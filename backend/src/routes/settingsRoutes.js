const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/thresholds', settingsController.getThresholds);
router.put('/thresholds', settingsController.updateThresholds);

module.exports = router;
