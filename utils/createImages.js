const sharp = require('sharp');
const path = require('path');

module.exports = async function createImages(
  imageBuffer, // tempImagePath
  outputDir,
  newName,
  resizeOptions
) {
  // Define constants of proportionality for small and medium versions
  const smallRatio = 0.5; // 50% of original width
  const mediumRatio = 0.75; // 75% of original width

  // Calculate dimensions for small and medium versions
  const smallWidth = Math.round(resizeOptions.width * smallRatio);
  const smallHeight = Math.round(resizeOptions.height * smallRatio);

  const mediumWidth = Math.round(resizeOptions.width * mediumRatio);
  const mediumHeight = Math.round(resizeOptions.height * mediumRatio);

  const output = path.join(outputDir, newName);

  // temporarily disable cache to prevent images stuck in node.js
  sharp.cache(false);

  // create original image
  await sharp(imageBuffer)
    .resize(resizeOptions.width, resizeOptions.height)
    .toFormat('jpeg')
    .toFile(output);

  // small webp
  await sharp(output)
    .resize(smallWidth, smallHeight)
    .toFormat('webp')
    .toFile(output.replace('.jpg', '_small.webp'));

  // medium webp
  await sharp(output)
    .resize(mediumWidth.width, mediumHeight)
    .toFormat('webp')
    .toFile(output.replace('.jpg', '_medium.webp'));

  // create large webP image
  await sharp(output)
    .toFormat('webp')
    .toFile(output.replace('.jpg', '_large.webp'));
  // turn shart cache back on once image processing is done
  sharp.cache(false);
};
