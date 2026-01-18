const Item = require('../models/item.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const ApiError = require('../utils/ApiError');
const { getPaginationParams, getSortParams, getPaginatedResponse } = require('../utils/pagination');

class ItemService {
  async createItem(data) {
    if (data.category_id && data.subcategory_id) {
      throw new ApiError(400, 'Item cannot belong to both category and subcategory');
    }

    if (!data.category_id && !data.subcategory_id) {
      throw new ApiError(400, 'Item must belong to either category or subcategory');
    }

    if (data.subcategory_id) {
      const subcategory = await Subcategory.findById(data.subcategory_id);
      if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
      }
    } else if (data.category_id) {
      const category = await Category.findById(data.category_id);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
    }

    this.validatePricingConfig(data.pricing);

    const item = await Item.create(data);
    return item;
  }

  async getAllItems(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = getSortParams(query);

    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.category_id) {
      filter.category_id = query.category_id;
    }

    if (query.subcategory_id) {
      filter.subcategory_id = query.subcategory_id;
    }

    if (query.active !== undefined) {
      filter.is_active = query.active === 'true';
    }

    if (query.min_price || query.max_price) {
      filter['pricing.config.price'] = {};
      if (query.min_price) {
        filter['pricing.config.price'].$gte = parseFloat(query.min_price);
      }
      if (query.max_price) {
        filter['pricing.config.price'].$lte = parseFloat(query.max_price);
      }
    }

    const items = await Item.find(filter)
      .populate('category_id', 'name tax_applicable tax_percentage')
      .populate('subcategory_id', 'name tax_applicable tax_percentage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments(filter);

    return getPaginatedResponse(items, total, page, limit);
  }

  async getItemById(id) {
    const item = await Item.findById(id)
      .populate('category_id')
      .populate('subcategory_id');

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    return item;
  }

  async updateItem(id, data) {
    const item = await Item.findById(id);

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    if (data.pricing) {
      this.validatePricingConfig(data.pricing);
    }

    Object.assign(item, data);
    await item.save();

    return item;
  }

  async deleteItem(id) {
    const item = await Item.findById(id);

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    item.is_active = false;
    await item.save();

    return { message: 'Item deleted successfully' };
  }

  validatePricingConfig(pricing) {
    const { type, config } = pricing;

    switch (type) {
      case 'STATIC':
        if (!config.price || config.price < 0) {
          throw new ApiError(400, 'Static pricing requires valid price');
        }
        break;

      case 'TIERED':
        if (!config.tiers || !Array.isArray(config.tiers) || config.tiers.length === 0) {
          throw new ApiError(400, 'Tiered pricing requires tiers array');
        }

        const sortedTiers = config.tiers.sort((a, b) => a.max_duration - b.max_duration);
        for (let i = 0; i < sortedTiers.length - 1; i++) {
          if (sortedTiers[i].max_duration >= sortedTiers[i + 1].max_duration) {
            throw new ApiError(400, 'Tiers must not overlap');
          }
        }
        break;

      case 'COMPLIMENTARY':
        break;

      case 'DISCOUNTED':
        if (!config.base_price || config.base_price < 0) {
          throw new ApiError(400, 'Discounted pricing requires base_price');
        }
        if (!config.discount_type || !['FLAT', 'PERCENTAGE'].includes(config.discount_type)) {
          throw new ApiError(400, 'discount_type must be FLAT or PERCENTAGE');
        }
        if (!config.discount_value || config.discount_value < 0) {
          throw new ApiError(400, 'discount_value must be positive');
        }
        break;

      case 'DYNAMIC':
        if (!config.time_windows || !Array.isArray(config.time_windows)) {
          throw new ApiError(400, 'Dynamic pricing requires time_windows array');
        }
        break;

      default:
        throw new ApiError(400, `Invalid pricing type: ${type}`);
    }
  }
}

module.exports = new ItemService();