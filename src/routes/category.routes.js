const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const validate = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.schema');

router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;