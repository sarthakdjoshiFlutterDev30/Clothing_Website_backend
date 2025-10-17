const express = require('express');
const { getUsers, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id/role')
  .patch(protect, authorize('admin'), updateUserRole);

module.exports = router;


