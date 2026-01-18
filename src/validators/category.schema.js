const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  tax_applicable: z.boolean().default(false),
  tax_percentage: z.number().min(0).max(100).optional().nullable(),
}).refine(
  (data) => {
    if (data.tax_applicable && !data.tax_percentage) {
      return false;
    }
    return true;
  },
  {
    message: 'tax_percentage is required when tax_applicable is true',
  }
);

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  tax_applicable: z.boolean().optional(),
  tax_percentage: z.number().min(0).max(100).optional().nullable(),
  is_active: z.boolean().optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};