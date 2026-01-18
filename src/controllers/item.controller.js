const itemService = require('../services/item.service');
const pricingService = require('../services/pricing.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createItem = asyncHandler(async (req, res) => {
  const item = await itemService.createItem(req.body);
  
  res.status(201).json({
    success: true,
    data: item,
  });
});

exports.getAllItems = asyncHandler(async (req, res) => {
  const result = await itemService.getAllItems(req.query);
  
  res.json(result);
});

exports.getItemById = asyncHandler(async (req, res) => {
  const item = await itemService.getItemById(req.params.id);
  
  res.json({
    success: true,
    data: item,
  });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.params.id, req.body);
  
  res.json({
    success: true,
    data: item,
  });
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const result = await itemService.deleteItem(req.params.id);
  
  res.json({
    success: true,
    message: result.message,
  });
});

exports.getItemPrice = asyncHandler(async (req, res) => {
  const priceBreakdown = await pricingService.calculatePrice(
    req.params.id,
    req.query
  );
  
  res.json({
    success: true,
    data: priceBreakdown,
  });
});