const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Item = require('../models/item.model');
const ApiError = require('../utils/ApiError');
const { getPaginationParams, getSortParams, getPaginatedResponse } = require('../utils/pagination');

class CategoryService {
  async createCategory(data) {
    if (data.tax_applicable && !data.tax_percentage) {
      throw new ApiError(400, 'tax_percentage is required when tax_applicable is true');
    }

    const category = await Category.create(data);
    return category;
  }

  async getAllCategories(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = getSortParams(query);

    const filter = {};
    if (query.active !== undefined) {
      filter.is_active = query.active === 'true';
    }

    const categories = await Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(filter);

    return getPaginatedResponse(categories, total, page, limit);
  }

  async getCategoryById(id) {
    const category = await Category.findById(id);
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    return category;
  }

  async updateCategory(id, data) {
    const category = await Category.findById(id);
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    const taxApplicable = data.tax_applicable !== undefined ? data.tax_applicable : category.tax_applicable;
    const taxPercentage = data.tax_percentage !== undefined ? data.tax_percentage : category.tax_percentage;

    if (taxApplicable && !taxPercentage) {
      throw new ApiError(400, 'tax_percentage is required when tax_applicable is true');
    }

    Object.assign(category, data);
    await category.save();

    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    category.is_active = false;
    await category.save();
    await Subcategory.updateMany({ category_id: id }, { is_active: false });
    await Item.updateMany({ category_id: id }, { is_active: false });

    return { message: 'Category deleted successfully' };
  }
}

module.exports = new CategoryService();