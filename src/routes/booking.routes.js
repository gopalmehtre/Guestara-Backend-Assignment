const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const validate = require('../middlewares/validate.middleware');
const { createBookingSchema } = require('../validators/booking.schema');

router.get('/items/:itemId/slots', bookingController.getAvailableSlots);
router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;