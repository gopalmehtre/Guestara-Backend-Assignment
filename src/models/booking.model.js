const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time_slot: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index(
  { item_id: 1, date: 1, 'time_slot.start': 1 },
  { unique: true }
);

module.exports = mongoose.model('Booking', bookingSchema);