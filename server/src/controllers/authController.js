const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @desc   Admin Login
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: { username, role: 'admin' },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Verify token (for frontend auth check)
 * @route  GET /api/auth/verify
 * @access Admin
 */
const verifyToken = (req, res) => {
  res.json({ valid: true, admin: req.admin });
};

module.exports = { login, verifyToken };
