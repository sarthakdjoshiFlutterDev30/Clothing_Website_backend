const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems, shippingInfo, paymentInfo } = req.body;

  // Calculate prices
  let itemsPrice = 0;
  const orderItemsWithPrices = [];

  // Fetch all products in one query to minimize DB roundtrips
  const productIds = orderItems.map(i => i.product);
  const productsMap = new Map(
    (await Product.find({ _id: { $in: productIds } }, { name: 1, price: 1, images: 1, stock: 1 }).lean())
      .map(p => [String(p._id), p])
  );

  for (const item of orderItems) {
    const product = productsMap.get(String(item.product));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.product}`
      });
    }

    const price = product.price * item.quantity;
    itemsPrice += price;

    orderItemsWithPrices.push({
      product: item.product,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: product.images?.[0]?.url
    });
  }

  // India-specific: GST at 18%
  const taxPrice = Math.round(itemsPrice * 0.18);

  // India-specific shipping: free at ₹500 and above, else ₹100
  const shippingPrice = itemsPrice >= 500 ? 0 : 100;

  const order = await Order.create({
    user: req.user._id,
    orderItems: orderItemsWithPrices,
    shippingInfo,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice: itemsPrice + taxPrice + shippingPrice
  });

  // Send order confirmation email (non-blocking)
  try {
    const populated = await Order.findById(order._id).populate('user', 'name email');
    if (populated && populated.user && populated.user.email) {
      const html = generateOrderEmailHtml(populated, 'placed');
      await sendEmail({
        email: populated.user.email,
        subject: `Order Placed Successfully - ${String(populated._id).slice(-6).toUpperCase()}`,
        message: 'Your order has been placed successfully.',
        html
      });
    }
  } catch (e) {
    console.log('Order confirmation email failed:', e.message);
  }

  // Clear user's cart (non-blocking)
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], totalItems: 0, totalPrice: 0 } },
      { new: true }
    );
  } catch (e) {
    console.log('Clearing cart after order failed:', e.message);
  }

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').lean();

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this order'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id, orderStatus: { $ne: 'Cancelled' } }, { orderItems: 1, totalPrice: 1, orderStatus: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } }, { orderItems: 1, totalPrice: 1, orderStatus: 1, createdAt: 1, user: 1 })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  let totalAmount = 0;
  orders.forEach(order => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    totalAmount,
    data: orders
  });
});

// @desc    Cancel own order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelMyOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Only order owner or admin can cancel
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Not authorized to cancel this order' });
  }
  // Delete the order on cancel so it no longer appears anywhere
  await order.deleteOne();

  res.status(200).json({ success: true, message: 'Order cancelled and deleted' });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Prevent changes after Delivered unless admin forces override
  if (order.orderStatus === 'Delivered' && !req.body.forceOverride) {
    return res.status(400).json({
      success: false,
      message: 'You have already delivered this order'
    });
  }

  if (req.body.orderStatus === 'Shipped') {
    // Deduct stock per size when shipping
    order.orderItems.forEach(async (item) => {
      await updateStockBySize(item.product, item.size, item.quantity);
    });
  }

  const nextStatus = req.body.orderStatus;
  if (nextStatus === 'Cancelled') {
    await order.deleteOne();
    return res.status(200).json({ success: true, message: 'Order cancelled and deleted' });
  }
  order.orderStatus = nextStatus;

  if (nextStatus === 'Delivered') {
    order.deliveredAt = Date.now();
  } else if (req.body.forceOverride && order.deliveredAt) {
    // If overriding from Delivered to another status, clear deliveredAt
    order.deliveredAt = undefined;
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });

  // Notify user about status update (non-blocking)
  try {
    const populated = await Order.findById(order._id).populate('user', 'name email');
    if (populated && populated.user && populated.user.email) {
      const html = generateOrderEmailHtml(populated, 'status');
      await sendEmail({
        email: populated.user.email,
        subject: `Your order status updated to ${populated.orderStatus}`,
        message: `Order status updated to ${populated.orderStatus}`,
        html
      });
    }
  } catch (e) {
    console.log('Order status email failed:', e.message);
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// Helper function to update stock
async function updateStockBySize(productId, size, quantity) {
  const product = await Product.findById(productId);
  if (!product) return;

  // Update size-level stock when size is provided; otherwise fall back to total stock
  if (size && Array.isArray(product.sizes) && product.sizes.length > 0) {
    const sizeEntry = product.sizes.find((s) => String(s.size) === String(size));
    if (sizeEntry) {
      sizeEntry.stock = Math.max(0, Number(sizeEntry.stock || 0) - Number(quantity || 0));
    }
    // Recompute total stock as sum of size stocks if sizes exist
    const summed = product.sizes.reduce((acc, s) => acc + Number(s.stock || 0), 0);
    product.stock = Math.max(0, summed);
  } else {
    // No sizes info; decrement total stock as a fallback
    product.stock = Math.max(0, Number(product.stock || 0) - Number(quantity || 0));
  }

  await product.save({ validateBeforeSave: false });
}

// Build simple HTML for order emails
function generateOrderEmailHtml(order, type) {
  const title = type === 'placed' ? 'Order placed successfully' : `Order status updated to ${order.orderStatus}`;
  const itemsRows = (order.orderItems || []).map(item => `
    <tr>
      <td style="padding:8px;border:1px solid #eee;">${escapeHtml(item.name)}</td>
      <td style="padding:8px;border:1px solid #eee;">${Number(item.quantity)}</td>
      <td style="padding:8px;border:1px solid #eee;">₹${Number(item.price).toFixed(0)}</td>
    </tr>
  `).join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      <h2 style="color:#111;">${title}</h2>
      <p style="color:#444;">Order ID: ${String(order._id)}</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border:1px solid #eee;">Item</th>
            <th style="text-align:left;padding:8px;border:1px solid #eee;">Qty</th>
            <th style="text-align:left;padding:8px;border:1px solid #eee;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <p style="color:#111;font-weight:bold;">Total: ₹${Number(order.totalPrice).toFixed(0)}</p>
      <p style="color:#555;">We will notify you when there are further updates.</p>
    </div>
  `;
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
