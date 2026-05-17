const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController');
const { upload } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

/**
 * POST /api/upload
 * Field name: "images" (supports up to 10 files)
 */
router.post('/', protect, upload.array('images', 10), uploadImages);

module.exports = router;
