const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', alertController.getAlerts);

// PATCH routes per requirement
router.patch('/:id/acknowledge', optionalAuth, alertController.acknowledgeAlert);
router.patch('/:id/resolve', optionalAuth, alertController.resolveAlert);

// POST routes for flexibility in API testing / Postman
router.post('/:id/acknowledge', optionalAuth, alertController.acknowledgeAlert);
router.post('/:id/resolve', optionalAuth, alertController.resolveAlert);

module.exports = router;
