const Order = require('../models/Order');
const telegramService = require('../services/telegramService');

/**
 * @desc   Create a new order
 * @route  POST /api/orders
 * @access Public
 */
const createOrder = async (req, res) => {
  try {
    const { name, phone, address, items, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    const order = await Order.create({ name, phone, address, items, totalPrice });

    // Send Telegram notification (non-blocking)
    telegramService.sendOrderNotification(order).catch((err) =>
      console.error('Telegram notification failed:', err.message)
    );

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get all orders (admin)
 * @route  GET /api/orders
 * @access Admin
 */
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get single order (admin)
 * @route  GET /api/orders/:id
 * @access Admin
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ message: 'Order not found' });
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Update order status (admin)
 * @route  PATCH /api/orders/:id/status
 * @access Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ message: 'Order not found' });
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get dashboard stats (admin)
 * @route  GET /api/orders/stats
 * @access Admin
 */
const getStats = async (req, res) => {
  try {
    const Product = require('../models/Product');

    const [totalOrders, totalProducts, revenueResult, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ status: 'pending' }),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({ totalOrders, totalProducts, totalRevenue, pendingOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getStats };
