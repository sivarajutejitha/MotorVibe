const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', motorController.getAllMotors);
router.get('/:id', motorController.getMotorById);
router.post('/', requireAuth, motorController.createMotor);
router.put('/:id', requireAuth, motorController.updateMotor);
router.delete('/:id', requireAuth, motorController.deleteMotor);

module.exports = router;
