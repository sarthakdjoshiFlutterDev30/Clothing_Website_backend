const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Goodluck Fashion'
  },
  siteDescription: {
    type: String,
    default: 'Premium clothing and accessories'
  },
  contactEmail: {
    type: String,
    default: 'contact@goodluckfashion.com'
  },
  phoneNumber: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  address: {
    type: String,
    default: '123 Fashion Street, New York, NY 10001'
  },
  gstNumber: {
    type: String,
    default: 'GSTIN: 22AAAAA0000A1Z5'
  },
  enableNotifications: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  taxRate: {
    type: Number,
    default: 8.5
  },
  shippingFee: {
    type: Number,
    default: 5.99
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
