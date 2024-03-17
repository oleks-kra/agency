const express = require('express');

// Import route handlers for different features
const articleRouter = require('./api/articleRoutes');
const categoryRouter = require('./api/categoryRoutes');

const router = express.Router();

// Mount route handlers for different features
router.use('/articles', articleRouter);
router.use('/categories', categoryRouter);

module.exports = router;
