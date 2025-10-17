const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  // Check if product already in wishlist
  const existingProduct = wishlist.products.find(
    product => product.toString() === productId
  );

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: 'Product already in wishlist'
    });
  }

  wishlist.products.push(productId);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist successfully',
    data: wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  const productIndex = wishlist.products.findIndex(
    product => product.toString() === req.params.productId
  );

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found in wishlist'
    });
  }

  wishlist.products.splice(productIndex, 1);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist successfully',
    data: wishlist
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  wishlist.products = [];
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully',
    data: wishlist
  });
});
