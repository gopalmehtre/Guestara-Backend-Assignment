const bookingService = require('../services/booking.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { date } = req.query;

  const slots = await bookingService.getAvailableSlots(itemId, date);
  
  res.json({
    success: true,
    data: slots,
  });
});

exports.createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  
  res.status(201).json({
    success: true,
    data: booking,
  });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings(req.query);
  
  res.json({
    success: true,
    data: bookings,
  });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id);
  
  res.json({
    success: true,
    data: booking,
  });
});