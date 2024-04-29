const express = require('express');

// Import route handlers for different features
const articleRouter = require('./api/articleRoutes');
const categoryRouter = require('./api/categoryRoutes');
const uploadRouter = require('./api/uploadRoutes');
const uniquenessRouter = require('./api/uniquenessRoutes');

const router = express.Router();

// Mount route handlers for different features: /api/v1
router.use('/articles', articleRouter);
router.use('/categories', categoryRouter);
router.use('/upload', uploadRouter);
router.use('/uniqueness', uniquenessRouter);

module.exports = router;
