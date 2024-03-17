const express = require('express');

// Import article controller methods
const {
  getForm,
  getAll,
  getOne
  /*createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle */
} = require('../../controllers/admin/articleController');

const router = express.Router();

// http://localhost:3000/admin/blog/articles
// /admin/blog/articles

router.route('/').get(getAll);
router.route('/form/:id?').get(getForm);
router.route('/:id').get(getOne);

module.exports = router;
