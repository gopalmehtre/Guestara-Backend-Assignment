const Booking = require('../models/booking.model');
const Item = require('../models/item.model');
const ApiError = require('../utils/ApiError');

class BookingService {
  async getAvailableSlots(itemId, date) {
    const item = await Item.findById(itemId);

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    if (!item.is_bookable) {
      throw new ApiError(400, 'This item is not bookable');
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (item.availability.days && !item.availability.days.includes(dayOfWeek)) {
      return {
        date,
        day: dayOfWeek,
        available_slots: [],
        message: 'Item not available on this day',
      };
    }

    const bookedSlots = await Booking.find({
      item_id: itemId,
      date: new Date(date),
      status: 'CONFIRMED',
    }).select('time_slot');

    const availableSlots = item.availability.time_slots.filter((slot) => {
      const isBooked = bookedSlots.some(
        (booking) =>
          booking.time_slot.start === slot.start &&
          booking.time_slot.end === slot.end
      );
      return !isBooked;
    });

    return {
      date,
      day: dayOfWeek,
      total_slots: item.availability.time_slots.length,
      booked_slots: bookedSlots.length,
      available_slots: availableSlots,
    };
  }

  async createBooking(data) {
    const item = await Item.findById(data.item_id);

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    if (!item.is_bookable) {
      throw new ApiError(400, 'This item is not bookable');
    }

    const dayOfWeek = new Date(data.date).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (item.availability.days && !item.availability.days.includes(dayOfWeek)) {
      throw new ApiError(400, `Item not available on ${dayOfWeek}`);
    }

    const validSlot = item.availability.time_slots.find(
      (slot) => slot.start === data.time_slot.start && slot.end === data.time_slot.end
    );

    if (!validSlot) {
      throw new ApiError(400, 'Invalid time slot');
    }

    const existingBooking = await Booking.findOne({
      item_id: data.item_id,
      date: new Date(data.date),
      'time_slot.start': data.time_slot.start,
      'time_slot.end': data.time_slot.end,
      status: 'CONFIRMED',
    });

    if (existingBooking) {
      throw new ApiError(409, 'This slot is already booked');
    }

    const booking = await Booking.create(data);

    return booking;
  }

  async getAllBookings(query) {
    const filter = {};

    if (query.item_id) {
      filter.item_id = query.item_id;
    }

    if (query.date) {
      filter.date = new Date(query.date);
    }

    if (query.status) {
      filter.status = query.status;
    }

    const bookings = await Booking.find(filter)
      .populate('item_id', 'name description')
      .sort({ date: -1, 'time_slot.start': 1 });

    return bookings;
  }
  
  async cancelBooking(id) {
    const booking = await Booking.findById(id);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw new ApiError(400, 'Booking already cancelled');
    }

    booking.status = 'CANCELLED';
    await booking.save();

    return booking;
  }
}

module.exports = new BookingService();