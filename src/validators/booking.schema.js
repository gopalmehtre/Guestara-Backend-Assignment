const { z } = require('zod');

const createBookingSchema = z.object({
  item_id: z.string().min(1, 'Item ID is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time_slot: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  }),
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email().optional().nullable(),
});

module.exports = {
  createBookingSchema,
};