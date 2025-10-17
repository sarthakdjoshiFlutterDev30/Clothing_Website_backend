const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const cloudinary = require('../utils/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const resPerPage = Math.min(parseInt(req.query.limit, 10) || 12, 50);
  const page = parseInt(req.query.page, 10) || 1;

  let query = {};

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by subcategory (Type)
  if (req.query.subcategory || req.query.type) {
    query.subcategory = req.query.subcategory || req.query.type;
  }

  // Filter by brand (support multiple comma-separated)
  if (req.query.brand) {
    const brands = String(req.query.brand).split(',').map(b => b.trim()).filter(Boolean);
    query.brand = brands.length > 1 ? { $in: brands } : brands[0];
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = parseFloat(req.query.maxPrice);
    }
  }

  // Filter by rating
  if (req.query.rating) {
    query.ratings = { $gte: parseFloat(req.query.rating) };
  }

  // Filter by size (match any variant size)
  if (req.query.size) {
    query['sizes.size'] = req.query.size;
  }

  // Filter by color (match any color name)
  if (req.query.color) {
    query['colors.name'] = req.query.color;
  }

  // Search by keyword (alias: q)
  const keyword = req.query.keyword || req.query.q;
  if (keyword) {
    query.$text = { $search: String(keyword) };
  }

  // Note: featured filter removed as isFeatured is deprecated

  // Filter by active status
  query.isActive = true;

  const skip = resPerPage * (page - 1);

  // Projection to reduce payload size for listing
  const listProjection = {
    name: 1,
    price: 1,
    originalPrice: 1,
    discount: 1,
    ratings: 1,
    numOfReviews: 1,
    images: { $slice: 1 },
    category: 1,
    subcategory: 1,
    // Include variant options for client to show per-product sizes/colors
    sizes: 1,
    colors: 1,
    createdAt: 1
  };

  let products = Product.find(query, listProjection)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(resPerPage)
    .lean();

  // Sort by price
  if (req.query.sort) {
    const sortBy = req.query.sort;
    if (sortBy === 'price-low') {
      products = products.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      products = products.sort({ price: -1 });
    } else if (sortBy === 'rating') {
      products = products.sort({ ratings: -1 });
    } else if (sortBy === 'newest') {
      products = products.sort({ createdAt: -1 });
    }
  }

  products = await products;

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    resPerPage,
    currentPage: page,
    totalPages: Math.ceil(total / resPerPage),
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
function toNumber(value, fallback = 0) {
  if (value == null) return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

exports.createProduct = asyncHandler(async (req, res, next) => {
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(f => ({ public_id: f.filename || f.public_id || f.originalname, url: f.path }));
  } else if (req.body.images) {
    const urls = ensureArray(req.body.images);
    images = urls.filter(Boolean).map(url => ({ public_id: url, url }));
  }

  const payload = { ...req.body };

  // Normalize scalar fields coming from multipart
  const price = toNumber(payload.price, 0);
  const originalPrice = toNumber(payload.originalPrice, price);
  const discount = payload.discount != null ? toNumber(payload.discount, 0) : (originalPrice > 0 ? Math.max(0, Math.round((1 - price / originalPrice) * 100)) : 0);
  const stock = toNumber(payload.stock, 0);

  // Defaults to satisfy schema without changing UI
  payload.name = payload.name || 'Untitled Product';
  payload.description = payload.description || 'Description not provided';
  payload.category = payload.category || 'men';
  payload.subcategory = payload.subcategory || 'general';
  payload.brand = 'Goodluck Fashion';
  payload.price = price;
  payload.originalPrice = originalPrice;
  payload.discount = discount;
  payload.stock = stock;
  payload.isActive = payload.isActive != null ? payload.isActive : true;

  // Sizes
  let sizes = payload.sizes;
  if (typeof sizes === 'string') {
    try { sizes = JSON.parse(sizes); } catch { sizes = []; }
  }
  if (!Array.isArray(sizes) || sizes.length === 0) {
    sizes = [{ size: 'M', stock }];
  }
  payload.sizes = sizes;

  // Colors
  let colors = payload.colors;
  if (typeof colors === 'string') {
    try { colors = JSON.parse(colors); } catch { colors = []; }
  }
  if (!Array.isArray(colors) || colors.length === 0) {
    colors = [{ name: 'Default', hex: '#000000' }];
  }
  payload.colors = colors;

  // Note: tags removed from schema; ignore any incoming tags

  // Shipping info defaults
  payload.shippingInfo = payload.shippingInfo || { freeShipping: false, estimatedDelivery: '3-5 business days' };

  if (images.length) payload.images = images;

  const product = await Product.create(payload);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const update = { ...req.body };
  // Force brand on updates as well
  update.brand = 'Goodluck Fashion';
  if (update.price != null) update.price = toNumber(update.price);
  if (update.originalPrice != null) update.originalPrice = toNumber(update.originalPrice);
  if (update.discount != null) update.discount = toNumber(update.discount);
  if (update.stock != null) update.stock = toNumber(update.stock);

  // Normalize images from body (URLs) and merge with newly uploaded files
  let mergedImages = [];
  if (update.images) {
    const fromBody = Array.isArray(update.images) ? update.images : [update.images];
    mergedImages.push(
      ...fromBody.filter(Boolean).map((img) => (
        typeof img === 'string' ? { public_id: img, url: img } : img
      ))
    );
    delete update.images;
  }
  if (req.files && req.files.length > 0) {
    const fromFiles = req.files.map(f => ({ public_id: f.filename || f.public_id || f.originalname, url: f.path }));
    mergedImages.push(...fromFiles);
  }
  if (mergedImages.length > 0) {
    update.images = mergedImages;
  }

  product = await Product.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Delete images from Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({
      success: false,
      message: 'Product already reviewed'
    });
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  product.numOfReviews = product.reviews.length;

  product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Review added successfully'
  });
});

// Note: featured products endpoint removed as isFeatured is deprecated

// @desc    Get inactive (deactivated) products (admin)
// @route   GET /api/products/inactive
// @access  Private/Admin
exports.getInactiveProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isActive: false }, { name: 1, price: 1, images: { $slice: 1 }, updatedAt: 1 })
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ 
    category: req.params.category,
    isActive: true 
  }, { name: 1, price: 1, images: { $slice: 1 }, ratings: 1, createdAt: 1 })
  .sort({ createdAt: -1 })
  .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a search keyword'
    });
  }

  const products = await Product.find({
    $text: { $search: keyword },
    isActive: true
  }, { name: 1, price: 1, images: { $slice: 1 }, ratings: 1, score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })
  .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});
