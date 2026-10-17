const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const readingsController = require('../controllers/readingsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', motorController.getAllMotors);
router.get('/:id', motorController.getMotorById);
router.get('/:id/readings', readingsController.getMotorReadings);
router.get('/:id/readings/history', (req, res, next) => {
  req.query.motor_id = req.params.id;
  readingsController.getReadingsHistory(req, res, next);
});
router.post('/', requireAuth, motorController.createMotor);
router.put('/:id', requireAuth, motorController.updateMotor);
router.delete('/:id', requireAuth, motorController.deleteMotor);

module.exports = router;
