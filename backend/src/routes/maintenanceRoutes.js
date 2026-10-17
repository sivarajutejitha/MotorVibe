const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', maintenanceController.getMaintenanceRecords);
router.post('/', requireAuth, maintenanceController.createMaintenanceRecord);
router.put('/:id', requireAuth, maintenanceController.updateMaintenanceRecord);
router.delete('/:id', requireAuth, maintenanceController.deleteMaintenanceRecord);

module.exports = router;
