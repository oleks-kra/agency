const express = require('express');

const {
  tinyMultipartFormData,
  tinyResizeImage
} = require('../../controllers/api/imageUploadController');

const router = express.Router();

// http://localhost:3000/api/v1/upload'
router.route('/').post(tinyMultipartFormData, tinyResizeImage);

module.exports = router;
