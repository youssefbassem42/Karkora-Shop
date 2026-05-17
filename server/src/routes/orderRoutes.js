const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getStats,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/', createOrder);

// Admin
router.get('/stats', protect, getStats);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;
