const express = require('express');

// Import article controller methods
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle
} = require('../../controllers/api/articleController');

const {
  processMultipartFormData,
  resizeImage
} = require('../../controllers/api/imageUploadController');

const router = express.Router();

// ARTICLES
// http://localhost:3000/api/v1/articles'
router
  .route('/')
  .post(processMultipartFormData, createArticle)
  .get(getArticles);
router.route('/:slug').get(getArticle);
router
  .route('/:id')
  .delete(deleteArticle)
  .patch(processMultipartFormData, resizeImage, updateArticle);

module.exports = router;
