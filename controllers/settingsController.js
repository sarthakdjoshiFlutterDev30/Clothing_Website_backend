const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public (for maintenance mode check)
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin only)
const updateSettings = asyncHandler(async (req, res) => {
  console.log('Update settings request body:', req.body);
  console.log('User making request:', req.user);
  
  const settings = await Settings.getSettings();
  console.log('Current settings from DB:', settings);
  
  const updatedSettings = await Settings.findByIdAndUpdate(
    settings._id,
    req.body,
    { new: true, runValidators: true }
  );

  console.log('Updated settings:', updatedSettings);

  res.status(200).json({
    success: true,
    data: updatedSettings
  });
});

// @desc    Get maintenance mode status
// @route   GET /api/settings/maintenance
// @access  Public
const getMaintenanceMode = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  
  res.status(200).json({
    success: true,
    maintenanceMode: settings.maintenanceMode
  });
});

module.exports = {
  getSettings,
  updateSettings,
  getMaintenanceMode
};
