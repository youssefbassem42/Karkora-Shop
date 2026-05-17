const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['makeup', 'accessories'],
    },
    // Primary image for backwards compatibility + quick access
    image: {
      type: String,
      default: '',
    },
    // All uploaded images (first one mirrors `image`)
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'A product can have at most 10 images',
      },
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Keep `image` in sync with the first item in `images` before saving
productSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
  next();
});

// Index for faster category filtering
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
