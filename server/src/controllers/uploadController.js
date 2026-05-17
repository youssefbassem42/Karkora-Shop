const { processImages } = require('../middleware/uploadMiddleware');

/**
 * @desc   Upload one or more product images (compress → WebP → save to disk)
 * @route  POST /api/upload
 * @access Admin
 */
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    const urls = await processImages(req.files);

    res.status(201).json({
      message: `${urls.length} image(s) uploaded successfully`,
      urls,                   // array of /uploads/xxx.webp paths
      url: urls[0] ?? null,  // convenience: first image
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadImages };
