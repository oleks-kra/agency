const express = require('express');

// Import article controller methods
const { displayHome } = require('../../controllers/admin/homeController');

const router = express.Router();

router.route('/').get(displayHome);

module.exports = router;
