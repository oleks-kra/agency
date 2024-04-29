const express = require('express');

// Import uniqueness controller methods
const { getArticle } = require('../../controllers/api/uniquenessController');

const router = express.Router();

// CHECK IF UNIQUE
// http://localhost:3000/api/v1/uniqueness'
router.route('/:slug').get(getArticle);

module.exports = router;
