const probe = require('probe-image-size');
const bufferToStream = require('./bufferToStream');

module.exports = async function isImageWideEnough(imageBuffer, minImageWidth) {
  // see if image is wide-enough
  const dimensions = await probe(bufferToStream(imageBuffer));
  return dimensions.width >= Number(minImageWidth);
};
