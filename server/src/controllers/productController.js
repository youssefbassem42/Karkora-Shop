const Product = require('../models/Product');
const { deleteImages } = require('../middleware/uploadMiddleware');

/**
 * @desc   Get all ACTIVE products (public) with optional category filter
 * @route  GET /api/products
 * @access Public
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (category && ['makeup', 'accessories'].includes(category)) {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get ALL products including inactive (admin)
 * @route  GET /api/products/all
 * @access Admin
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products, total: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get single product by ID
 * @route  GET /api/products/:id
 * @access Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Create a new product
 * @route  POST /api/products
 * @access Admin
 */
const createProduct = async (req, res) => {
  try {
    const { name, price, category, images, description, isActive } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    // Normalize: accept either array or single string
    const imgArray = Array.isArray(images) ? images : [images];

    const product = await Product.create({
      name,
      price,
      category,
      images: imgArray,
      image: imgArray[0],        // keep primary image in sync
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Update a product
 * @route  PUT /api/products/:id
 * @access Admin
 */
const updateProduct = async (req, res) => {
  try {
    const { images, ...rest } = req.body;

    const updateData = { ...rest };

    if (images !== undefined) {
      const imgArray = Array.isArray(images) ? images : [images];
      updateData.images = imgArray;
      updateData.image = imgArray[0] || '';
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Delete a product (also removes its uploaded images from disk)
 * @route  DELETE /api/products/:id
 * @access Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Clean up uploaded images from disk
    if (product.images?.length) {
      deleteImages(product.images);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Toggle product active/inactive status
 * @route  PATCH /api/products/:id/status
 * @access Admin
 */
const toggleProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
};
