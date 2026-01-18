const { z } = require('zod');

const pricingSchema = z.object({
  type: z.enum(['STATIC', 'TIERED', 'COMPLIMENTARY', 'DISCOUNTED', 'DYNAMIC']),
  config: z.any(),
});

const createItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  category_id: z.string().optional().nullable(),
  subcategory_id: z.string().optional().nullable(),
  tax_applicable: z.boolean().optional().nullable(),
  tax_percentage: z.number().min(0).max(100).optional().nullable(),
  pricing: pricingSchema,
  is_bookable: z.boolean().default(false),
  availability: z.object({
    days: z.array(z.string()).optional().nullable(),
    time_slots: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ).optional().nullable(),
  }).optional(),
  is_active: z.boolean().default(true),
});

const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  tax_applicable: z.boolean().optional().nullable(),
  tax_percentage: z.number().min(0).max(100).optional().nullable(),
  pricing: pricingSchema.optional(),
  is_bookable: z.boolean().optional(),
  availability: z.object({
    days: z.array(z.string()).optional().nullable(),
    time_slots: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ).optional().nullable(),
  }).optional(),
  is_active: z.boolean().optional(),
});

module.exports = {
  createItemSchema,
  updateItemSchema,
};