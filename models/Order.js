const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  shippingInfo: {
    firstName: {
      type: String,
      required: [true, 'Please provide first name']
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name']
    },
    email: {
      type: String,
      required: [true, 'Please provide email']
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please provide street address']
      },
      city: {
        type: String,
        required: [true, 'Please provide city']
      },
      state: {
        type: String,
        required: [true, 'Please provide state']
      },
      zipCode: {
        type: String,
        required: [true, 'Please provide zip code']
      },
      country: {
        type: String,
        required: [true, 'Please provide country']
      }
    }
  },
  paymentInfo: {
    id: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'cash_on_delivery']
    }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'Processing',
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned']
  },
  deliveredAt: Date,
  trackingNumber: String,
  notes: String
}, {
  timestamps: true
});

// Helpful indexes for frequent queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

// Calculate total price before saving
orderSchema.pre('save', function(next) {
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
