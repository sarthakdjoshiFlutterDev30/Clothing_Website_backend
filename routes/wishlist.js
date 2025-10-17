const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlistController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/:productId').delete(protect, removeFromWishlist);

module.exports = router;
