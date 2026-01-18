const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  
  res.status(201).json({
    success: true,
    data: category,
  });
});

exports.getAllCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getAllCategories(req.query);
  
  res.json(result);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  
  res.json({
    success: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  
  res.json({
    success: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  
  res.json({
    success: true,
    message: result.message,
  });
});