// 'viewRoutes.js'
const express = require('express');

const { displayHomepage } = require('../controllers/viewController');

const router = express.Router();

// http://localhost:3000/
router.route('/').get(displayHomepage);

module.exports = router;
