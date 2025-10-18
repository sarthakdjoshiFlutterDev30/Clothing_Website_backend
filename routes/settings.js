const express = require('express');
const { getSettings, updateSettings, getMaintenanceMode } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/maintenance', getMaintenanceMode);

// Protected routes (Admin only)
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
