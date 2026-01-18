const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    is_mandatory: {
      type: Boolean,
      default: false,
    },
    group: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

addonSchema.index({ item_id: 1 });
addonSchema.index({ is_active: 1 });

module.exports = mongoose.model('Addon', addonSchema);