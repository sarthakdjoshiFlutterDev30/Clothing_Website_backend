const express = require('express');
const {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  cancelMyOrder
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin'), getAllOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

router.route('/:id/cancel').put(protect, cancelMyOrder);

module.exports = router;
