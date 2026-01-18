const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    subcategory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
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
    
    pricing: {
      type: {
        type: String,
        enum: ['STATIC', 'TIERED', 'COMPLIMENTARY', 'DISCOUNTED', 'DYNAMIC'],
        required: true,
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
    },

    is_bookable: {
      type: Boolean,
      default: false,
    },
    availability: {
      days: {
        type: [String],
        default: null,
      },
      time_slots: [
        {
          start: String,
          end: String,  
        },
      ],
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

itemSchema.pre('save', function (next) {
  if (this.category_id && this.subcategory_id) {
    next(new Error('Item cannot belong to both category and subcategory'));
  }
  if (!this.category_id && !this.subcategory_id) {
    next(new Error('Item must belong to either category or subcategory'));
  }
  // next();
});

itemSchema.index({ category_id: 1 });
itemSchema.index({ subcategory_id: 1 });
itemSchema.index({ is_active: 1 });
itemSchema.index({ name: 'text' });

module.exports = mongoose.model('Item', itemSchema);