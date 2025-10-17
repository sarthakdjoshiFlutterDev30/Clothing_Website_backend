const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductsByCategory,
  searchProducts,
  getInactiveProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const { storage } = require('../utils/cloudinaryStorage');
const upload = multer({ storage });

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), upload.array('images', 6), createProduct);

// Featured route removed (isFeatured deprecated)
router.route('/inactive').get(protect, authorize('admin'), getInactiveProducts);
router.route('/search').get(searchProducts);
router.route('/category/:category').get(getProductsByCategory);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), upload.array('images', 6), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
