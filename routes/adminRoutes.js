const express = require('express');

// Import route handlers for different features
const homeRouter = require('./admin/homeRoutes');
const articleRouter = require('./admin/articleRoutes');
const categoryRouter = require('./admin/categoryRoutes');

const router = express.Router();

// HOME
router.use('/', homeRouter);

// BLOG
router.use('/blog/articles', articleRouter);
router.use('/blog/categories', categoryRouter);

// SERVICES

module.exports = router;
