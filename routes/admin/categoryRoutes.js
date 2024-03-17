const express = require('express');

// Import article controller methods
const {
  getForm,
  getAll,
  getOne
} = require('../../controllers/admin/categoryController');

const router = express.Router();

// http://localhost:3000/admin/blog/categories
router.route('/').get(getAll);
router.route('/form/:id?').get(getForm);
router.route('/:id').get(getOne);

module.exports = router;
