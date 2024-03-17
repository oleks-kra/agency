const express = require('express');

// Import category controller methods
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/api/categoryController');

const {
  processMultipartFormData,
  resizeImage
} = require('../../controllers/api/imageUploadController');

const router = express.Router();

// CATEGORIES
// http://localhost:3000/api/v1/categories'
router
  .route('/')
  .post(processMultipartFormData, createCategory)
  .get(getCategories);
router.route('/:slug').get(getCategory);

router
  .route('/:id')
  .delete(deleteCategory)
  .patch(processMultipartFormData, resizeImage, updateCategory);

module.exports = router;
