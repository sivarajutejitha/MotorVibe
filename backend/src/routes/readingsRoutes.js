const express = require('express');
const router = express.Router();
const readingsController = require('../controllers/readingsController');

router.get('/history', readingsController.getReadingsHistory);
router.get('/live/:motorId', readingsController.getLiveReadingByMotor);
router.get('/stats/:motorId', readingsController.getMotorStats);

module.exports = router;
