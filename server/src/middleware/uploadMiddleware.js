const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Store files in memory first, then process with sharp
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, GIF and AVIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB raw limit before compression
    files: 10,                   // max 10 files per request
  },
});

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Process and compress uploaded image buffers using sharp.
 * Returns an array of relative URL paths: /uploads/filename.webp
 */
const processImages = async (files) => {
  const urls = [];

  for (const file of files) {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
    const outputPath = path.join(UPLOADS_DIR, uniqueName);

    await sharp(file.buffer)
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',       // never upscale, preserves aspect ratio
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,         // good balance of quality vs size
        effort: 4,           // compression effort (0-6)
        smartSubsample: true,
      })
      .toFile(outputPath);

    urls.push(`/uploads/${uniqueName}`);
  }

  return urls;
};

/**
 * Delete image files from disk given their URL paths.
 */
const deleteImages = (imagePaths = []) => {
  for (const imgPath of imagePaths) {
    // imgPath is like /uploads/filename.webp
    const filename = path.basename(imgPath);
    const fullPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

module.exports = { upload, processImages, deleteImages };
