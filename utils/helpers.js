const mongoose = require('mongoose');

function isValidObjectId(val) {
  return mongoose.isValidObjectId(val);
}

module.exports = { isValidObjectId };
