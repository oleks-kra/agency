const sharp = require('sharp');
const path = require('path');

module.exports = async function createImages(
  imageBuffer,
  dirPath, // temp folder location
  newName
) {
  const output = path.join(dirPath, newName);

  // temporarily disable cache to prevent images stuck in node.js
  sharp.cache(false);

  // create original image
  await sharp(imageBuffer).toFormat('jpeg').toFile(output);

  // create large webP image
  //await sharp(output).toFormat('webp').toFile(output.replace('.jpg', '.webp'));
  // turn shart cache back on once image processing is done
  sharp.cache(true);
};
