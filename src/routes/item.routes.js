const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const validate = require('../middlewares/validate.middleware');
const { createItemSchema, updateItemSchema } = require('../validators/item.schema');

router.get('/:id/price', itemController.getItemPrice);

router.post('/', validate(createItemSchema), itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', validate(updateItemSchema), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;