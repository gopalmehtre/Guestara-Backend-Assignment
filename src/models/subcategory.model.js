const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
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
      default: null, 
    },
    tax_percentage: {
      type: Number,
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

subcategorySchema.index({ category_id: 1, name: 1 }, { unique: true });
subcategorySchema.index({ is_active: 1 });

module.exports = mongoose.model('Subcategory', subcategorySchema);