const sharp = require('sharp');

async function generateWebpImage(
  filenameBase,
  width,
  originalImage,
  outputDir,
  sizes
) {
  // 'newFilename' sample name: 852-6n9z-apple-480w.webp
  const newFilename = `${filenameBase.split('.')[0]}-${width}w.webp`;
  await sharp(originalImage)
    .resize({ width })
    .toFormat('webp')
    .toFile(outputDir + newFilename);

  // store info about the resized image to return to the calling function
  sizes.push({
    width,
    flnm: newFilename
  });
}

module.exports = async function createResponsiveCovers(
  imageBuffer, // image buffer
  coversDir, // where resized images must be saved
  filenameBase, // `${msString}-${uniqueId}-${request.file.originalname.split('.')[0]}.jpg`, for example: 153-1ys2-apple.jpg
  widthSlots, // array of sizes, as numbers
  imageMaxWidth, // number
  imageMaxHeight
) {
  console.log('createResponsiveCovers() invoked');
  // temporarily disable cache to prevent images stuck in node.js
  sharp.cache(false);

  // Store the original file as is, but not bigger than the 'imageMaxWidth'. It will be a JPEG file that is used as the value of the 'src' attribute for RWD image fallback
  const jpegImagePath = coversDir + filenameBase;

  await sharp(imageBuffer)
    .resize({
      width: imageMaxWidth,
      height: imageMaxHeight
    })
    .toFile(jpegImagePath);

  // value returned by the function
  const sizes = [];

  // for each widthSlot smaller than the image's width, generate an image with width that of the widthSlot
  const promises = widthSlots.map(async widthSlot => {
    await generateWebpImage(
      filenameBase,
      widthSlot,
      jpegImagePath,
      coversDir,
      sizes
    );
  });

  await Promise.all(promises);

  return sizes;
};
