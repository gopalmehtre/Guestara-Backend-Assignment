const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    tax_applicable: {
      type: Boolean,
      default: false,
    },
    tax_percentage: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (this.tax_applicable && (value === null || value === undefined)) {
            return false;
          }
          return true;
        },
        message: 'tax percentage is required when tax_applicable is true',
      },
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

categorySchema.index({ name: 1 });
categorySchema.index({ is_active: 1 });

module.exports = mongoose.model('Category', categorySchema);