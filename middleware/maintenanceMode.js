const Settings = require('../models/Settings');
const asyncHandler = require('./asyncHandler');

// @desc    Maintenance mode middleware - blocks all routes except admin during maintenance
// @access  Public
const maintenanceMode = asyncHandler(async (req, res, next) => {
  try {
    // Get maintenance mode status
    const settings = await Settings.getSettings();
    
    // If maintenance mode is disabled, allow all requests
    if (!settings.maintenanceMode) {
      return next();
    }
    
    // If maintenance mode is enabled, check if this is an admin route
    const isAdminRoute = req.path.startsWith('/admin') || 
                        req.path.includes('/admin') ||
                        (req.user && req.user.role === 'admin');
    
    // Allow admin routes and admin users
    if (isAdminRoute) {
      return next();
    }
    
    // Block all other routes during maintenance
    return res.status(503).json({
      success: false,
      message: 'System is under maintenance. Only administrators can access the system at this time.',
      maintenanceMode: true
    });
    
  } catch (error) {
    console.error('Error in maintenance mode middleware:', error);
    // If there's an error checking maintenance mode, allow the request to proceed
    // This prevents the system from being completely locked out due to a bug
    return next();
  }
});

// @desc    Maintenance mode middleware for auth routes - only allow admin login
// @access  Public
const maintenanceModeAuth = asyncHandler(async (req, res, next) => {
  try {
    // Get maintenance mode status
    const settings = await Settings.getSettings();
    
    // If maintenance mode is disabled, allow all auth requests
    if (!settings.maintenanceMode) {
      return next();
    }
    
    // If maintenance mode is enabled, only allow admin login
    // Check if this is a login request and if the user is trying to login as admin
    if (req.path === '/login' && req.method === 'POST') {
      const { email, password } = req.body;
      
      // We need to check if the email belongs to an admin user
      // Import User model to check user role
      const User = require('../models/User');
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user && user.role === 'admin') {
        // Allow admin login
        return next();
      } else {
        // Block non-admin login during maintenance
        return res.status(503).json({
          success: false,
          message: 'System is under maintenance. Only administrator login is allowed at this time.',
          maintenanceMode: true
        });
      }
    }
    
    // Block all other auth routes during maintenance (register, forgot password, etc.)
    return res.status(503).json({
      success: false,
      message: 'System is under maintenance. Only administrator login is allowed at this time.',
      maintenanceMode: true
    });
    
  } catch (error) {
    console.error('Error in maintenance mode auth middleware:', error);
    // If there's an error, allow the request to proceed to prevent lockout
    return next();
  }
});

module.exports = {
  maintenanceMode,
  maintenanceModeAuth
};
