const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    maxlength: [8, 'Price cannot exceed 99,999,999']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please provide original price']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['men', 'women', 'kids', 'accessories', 'sale']
  },
  subcategory: {
    type: String,
    required: [true, 'Please provide a subcategory']
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand']
  },
  sizes: [{
    size: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative']
    }
  }],
  colors: [{
    name: {
      type: String,
      required: true
    },
    hex: {
      type: String,
      required: true
    }
  }],
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    maxlength: [4, 'Stock cannot exceed 9999'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  material: String,
  careInstructions: String,
  shippingInfo: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    estimatedDelivery: {
      type: String,
      default: '3-5 business days'
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', productSchema);
