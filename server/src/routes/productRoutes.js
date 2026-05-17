const express = require('express');
const router = express.Router();
const {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/all', protect, getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/status', protect, toggleProductStatus);

module.exports = router;
