const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { maintenanceModeAuth } = require('../middleware/maintenanceMode');

const router = express.Router();

router.post('/register', maintenanceModeAuth, register);
router.post('/login', maintenanceModeAuth, login);
router.get('/logout', maintenanceModeAuth, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', maintenanceModeAuth, forgotPassword);
router.put('/resetpassword/:resettoken', maintenanceModeAuth, resetPassword);
router.get('/verify-email/:token', maintenanceModeAuth, verifyEmail);

module.exports = router;
