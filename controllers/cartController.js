const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity, size, color } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if product is active
  if (!product.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Product is not available'
    });
  }

  // Check stock availability
  const sizeStock = product.sizes.find(s => s.size === size);
  if (!sizeStock || sizeStock.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock for selected size'
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && item.size === size && item.color === color
  );

  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      size,
      color,
      price: product.price
    });
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  // Check stock availability
  const item = cart.items[itemIndex];
  const product = await Product.findById(item.product);
  const sizeStock = product.sizes.find(s => s.size === item.size);
  
  if (!sizeStock || sizeStock.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock for selected quantity'
    });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Cart item updated successfully',
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully',
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  cart.items = [];
  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart
  });
});
