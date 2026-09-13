const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

// Helper: compute prices
const calcPrices = (orderItems, coupon) => {
  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 499 ? 0 : 49;

  let discountPercent = 0;
  if (coupon && coupon.discountPercent) {
    discountPercent = coupon.discountPercent;
  } else {
    // Auto tier-based discount
    if (itemsPrice >= 2499) discountPercent = 10;
    else if (itemsPrice >= 1499) discountPercent = 5;
    else if (itemsPrice >= 999) discountPercent = 3;
  }

  const discountAmount = Math.round((itemsPrice * discountPercent) / 100);
  const totalPrice = itemsPrice - discountAmount + shippingPrice;
  return { itemsPrice, discountAmount, shippingPrice, totalPrice };
};

// @desc    Create a new order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponApplied } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const { itemsPrice, discountAmount, shippingPrice, totalPrice } = calcPrices(orderItems, couponApplied);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      discountAmount,
      shippingPrice,
      totalPrice,
      couponApplied,
    });

    // Send confirmation email for COD orders
    if (paymentMethod === 'COD') {
      order.orderStatus = 'Confirmed';
      await order.save();
      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmed #${order._id} — Kanha Collection`,
        html: `<h2>Jai Shri Krishna! 🙏</h2><p>Your order <strong>#${order._id}</strong> has been placed successfully.</p><p>Total: <strong>₹${totalPrice.toFixed(2)}</strong></p><p>We will dispatch it soon.</p>`,
      });
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    // Only admin or the order owner can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as paid (after Razorpay verify)
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult;
    order.orderStatus = 'Confirmed';
    const updatedOrder = await order.save();

    // Send confirmation email
    const user = await require('../models/User').findById(order.user);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `Payment Confirmed #${order._id} — Kanha Collection`,
        html: `<h2>Jai Shri Krishna! 🙏</h2><p>Your payment for order <strong>#${order._id}</strong> is confirmed.</p><p>Total Paid: <strong>₹${order.totalPrice.toFixed(2)}</strong></p><p>We will pack and dispatch your order soon.</p>`,
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.orderStatus = req.body.status;
    if (req.body.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/orders/stats
const getStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSalesResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const totalProducts = await Product.countDocuments();
    const totalUsers = await require('../models/User').countDocuments();

    res.json({ totalOrders, totalSales, totalProducts, totalUsers, monthlySales });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderToPaid, getAllOrders, updateOrderStatus, getStats };
