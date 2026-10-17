const express = require('express');
const router = express.Router();
const readingsController = require('../controllers/readingsController');

// Standardized sensor REST endpoints
router.get('/', readingsController.getAllSensors);
router.get('/:id', readingsController.getSensorById);

module.exports = router;
