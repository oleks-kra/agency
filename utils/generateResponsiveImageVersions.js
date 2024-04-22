const sharp = require('sharp');
const probe = require('probe-image-size');
const fs = require('fs');

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

module.exports = async function generateResponsiveImageVersions(
  pathToOriginalImage, // path to original image
  outputDir, // where resized images must be saved
  filenameBase, // `${msString}-${uniqueId}-${request.file.originalname.split('.')[0]}.jpg`, for example: 153-1ys2-apple.jpg
  widthSlots, // array of sizes, as numbers
  imageMaxWidth // number
) {
  console.log('generateResponsiveImageVersions() invoked');
  // temporarily disable cache to prevent images stuck in node.js
  sharp.cache(false);
  // read image's width and height
  const originalImageInfo = await probe(
    fs.createReadStream(pathToOriginalImage)
  );

  // Store the original file as is, but not bigger than the 'imageMaxWidth'. It will be a JPEG file that is used as the value of the 'src' attribute for RWD image fallback
  const jpegImagePath = outputDir + filenameBase;
  if (originalImageInfo.width > imageMaxWidth) {
    // Pretend the original image was uploaded at the largest allowed width
    originalImageInfo.width = imageMaxWidth;
    await sharp(pathToOriginalImage)
      .resize({ width: imageMaxWidth })
      .toFile(jpegImagePath);
  } else {
    await sharp(pathToOriginalImage).toFile(jpegImagePath);
  }

  // value returned by the function
  const sizes = [];

  // for each widthSlot smaller than the image's width, generate an image with width that of the widthSlot
  const promises = widthSlots.map(async widthSlot => {
    if (widthSlot <= originalImageInfo.width) {
      await generateWebpImage(
        filenameBase,
        widthSlot,
        jpegImagePath,
        outputDir,
        sizes
      );
    }
  });

  await Promise.all(promises);

  // Generate webp image in the original size as the image was loaded
  /*
  Let's say the original image size is 1200 pixels wide. If our widthSlots array contains size '1200,' we already have an image of that size. It means we no longer need to create one for the 2nd time
  */
  if (!widthSlots.includes(originalImageInfo.width)) {
    await generateWebpImage(
      filenameBase,
      originalImageInfo.width,
      jpegImagePath,
      outputDir,
      sizes
    );
  }

  console.log('sizes arr, as returned by the function:', sizes);
  return sizes;
};
