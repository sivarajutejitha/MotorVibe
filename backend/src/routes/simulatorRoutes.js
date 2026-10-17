const express = require('express');
const router = express.Router();
const simulatorController = require('../controllers/simulatorController');

router.get('/status', simulatorController.getStatus);
router.post('/toggle', simulatorController.toggleSimulator);
router.post('/inject-fault', simulatorController.injectFault);

module.exports = router;
