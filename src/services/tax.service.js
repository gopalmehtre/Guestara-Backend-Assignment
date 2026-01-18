const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');

class TaxService {
  async getEffectiveTax(item) {
    if (item.tax_applicable !== null) {
      return {
        applicable: item.tax_applicable,
        percentage: item.tax_percentage || 0,
      };
    }

    if (item.subcategory_id) {
      const subcategory = await Subcategory.findById(item.subcategory_id);
      
      if (subcategory.tax_applicable !== null) {
        return {
          applicable: subcategory.tax_applicable,
          percentage: subcategory.tax_percentage || 0,
        };
      }

      const category = await Category.findById(subcategory.category_id);
      return {
        applicable: category.tax_applicable,
        percentage: category.tax_percentage || 0,
      };
    }

    if (item.category_id) {
      const category = await Category.findById(item.category_id);
      return {
        applicable: category.tax_applicable,
        percentage: category.tax_percentage || 0,
      };
    }
    return { applicable: false, percentage: 0 };
  }

  calculateTaxAmount(basePrice, taxPercentage) {
    return (basePrice * taxPercentage) / 100;
  }
}

module.exports = new TaxService();