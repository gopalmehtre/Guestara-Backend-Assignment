const Item = require('../models/item.model');
const Addon = require('../models/addon.model');
const taxService = require('./tax.service');
const ApiError = require('../utils/ApiError');

class PricingService {
  async calculatePrice(itemId, context = {}) {
    const item = await Item.findById(itemId);
    
    if (!item) {
      throw new ApiError(404, 'Item not found');
    }

    if (!item.is_active) {
      throw new ApiError(400, 'Item is not active');
    }

    let basePrice = 0;
    let pricingDetails = {};
    switch (item.pricing.type) {
      case 'STATIC':
        ({ basePrice, details: pricingDetails } = this.handleStatic(item, context));
        break;

      case 'TIERED':
        ({ basePrice, details: pricingDetails } = this.handleTiered(item, context));
        break;

      case 'COMPLIMENTARY':
        ({ basePrice, details: pricingDetails } = this.handleComplimentary(item));
        break;

      case 'DISCOUNTED':
        ({ basePrice, details: pricingDetails } = this.handleDiscounted(item, context));
        break;

      case 'DYNAMIC':
        ({ basePrice, details: pricingDetails } = this.handleDynamic(item, context));
        break;

      default:
        throw new ApiError(400, `Unknown pricing type: ${item.pricing.type}`);
    }

    const addonTotal = await this.calculateAddons(itemId, context.addons || []);
    const tax = await taxService.getEffectiveTax(item);
    const subtotal = basePrice + addonTotal;
    const taxAmount = tax.applicable ? taxService.calculateTaxAmount(subtotal, tax.percentage) : 0;
    const grandTotal = subtotal + taxAmount;

    return {
      item_name: item.name,
      pricing_rule: item.pricing.type,
      pricing_details: pricingDetails,
      base_price: basePrice,
      addon_total: addonTotal,
      subtotal,
      tax: {
        applicable: tax.applicable,
        percentage: tax.percentage,
        amount: taxAmount,
      },
      grand_total: grandTotal,
    };
  }

  handleStatic(item, context) {
    const basePrice = item.pricing.config.price;
    
    return {
      basePrice,
      details: {
        type: 'STATIC',
        price: basePrice,
      },
    };
  }

  handleTiered(item, context) {
    const { duration } = context;
    
    if (!duration) {
      throw new ApiError(400, 'Duration is required for tiered pricing');
    }

    const tiers = item.pricing.config.tiers;
    const sortedTiers = tiers.sort((a, b) => a.max_duration - b.max_duration);
    let selectedTier = null;
    for (const tier of sortedTiers) {
      if (duration <= tier.max_duration) {
        selectedTier = tier;
        break;
      }
    }

    if (!selectedTier) {
      selectedTier = sortedTiers[sortedTiers.length - 1];
    }

    return {
      basePrice: selectedTier.price,
      details: {
        type: 'TIERED',
        duration,
        tier_used: `Up to ${selectedTier.max_duration} hours`,
        price: selectedTier.price,
      },
    };
  }

  handleComplimentary(item) {
    return {
      basePrice: 0,
      details: {
        type: 'COMPLIMENTARY',
        message: 'This item is complimentary',
      },
    };
  }

  handleDiscounted(item, context) {
    const { base_price, discount_type, discount_value } = item.pricing.config;

    let discountAmount = 0;
    
    if (discount_type === 'FLAT') {
      discountAmount = discount_value;
    } else if (discount_type === 'PERCENTAGE') {
      discountAmount = (base_price * discount_value) / 100;
    }

    const finalPrice = Math.max(0, base_price - discountAmount);

    return {
      basePrice: finalPrice,
      details: {
        type: 'DISCOUNTED',
        original_price: base_price,
        discount_type,
        discount_value,
        discount_amount: discountAmount,
        final_price: finalPrice,
      },
    };
  }

  handleDynamic(item, context) {
  const requestTime = context.time ? new Date(context.time): new Date();
  const currentTime = this.formatTime(requestTime);

  const timeWindows = item.pricing.config.time_windows;
  let selectedWindow = null;
  for (const window of timeWindows) {
    if (this.isTimeInRange(currentTime, window.start, window.end)) {
      selectedWindow = window;
      break;
    }
  }

  if (!selectedWindow) {
    throw new ApiError(400, 'Item not available at this time');
  }

  return {
    basePrice: selectedWindow.price,
    details: {
      type: 'DYNAMIC',
      current_time: currentTime,
      time_window: `${selectedWindow.start} - ${selectedWindow.end}`,
      price: selectedWindow.price,
    },
  };
}

  async calculateAddons(itemId, selectedAddonIds) {
    if (!selectedAddonIds || selectedAddonIds.length === 0) {
      return 0;
    }

    const addons = await Addon.find({
      _id: { $in: selectedAddonIds },
      item_id: itemId,
      is_active: true,
    });

    return addons.reduce((total, addon) => total + addon.price, 0);
  }

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  isTimeInRange(time, start, end) {
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const timeMin = timeToMinutes(time);
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  return timeMin >= startMin && timeMin < endMin;
}
}

module.exports = new PricingService();