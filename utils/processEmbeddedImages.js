const ArticleImage = require('../models/articleEmbededImageModel');
const { emptyDir } = require('./fileSystem');
const generateResponsiveImageVersions = require('./generateResponsiveImageVersions');

/**
 * Processes and handles embedded images associated with an article.
 * Moves the images from a temporary folder to a permanent destination,
 * saves their filenames and article associations to the database,
 * and cleans up the temporary folder afterwards.
 *
 * @param {array} imageFilenamesArr - An array of filenames of images that are being embedded into the article content.
 * @param {string} tempFolderPath - The path to the temporary folder where images are stored temporarily.
 * @param {string} articleEmbeddedImagesDir - The path to the directory where embedded images for the article are stored permanently.
 * @param {Object} doc - The Mongoose document instance representing the article.
 * @returns {Promise<void>} A promise that resolves with 'null' if (imageFilenamesArr.length === 0) or an array of ids from ArticleImages
 */
module.exports = async function processEmbeddedImages(
  imageFilenamesArr, // an array of filenames
  tempFolderPath,
  articleEmbeddedImagesDir,
  doc
) {
  console.log('START INSIDE "processEmbeddedImages"');
  if (imageFilenamesArr.length > 0) {
    const articleImagesToSave = [];
    // 'widthSlots': 480,600,800,1200
    const widthSlots = process.env.EMBEDED_IMAGE_WIDTH_SLOTS.split(',').map(
      str => Number(str)
    );
    const promises = imageFilenamesArr.map(async filename => {
      // Move image from 'tempFolderPath' folder to its permanent destination at 'embeddedImagesDir'
      const sizes = await generateResponsiveImageVersions(
        tempFolderPath + filename, // original image path
        articleEmbeddedImagesDir, // where to save
        filename, // filename base to use
        widthSlots, // sizes to create
        Number(process.env.EMBEDED_IMAGE_MAX_WIDTH) // max pixel wide image to create
      );
      // Store an image object in an array to persist them all in one operation
      if (sizes.length > 0) {
        articleImagesToSave.push({
          filename,
          articleId: doc.id,
          sizes
        });
      } else {
        articleImagesToSave.push({
          filename,
          articleId: doc.id
        });
      }
    });

    // Wait for all promises to resolve before continuing
    await Promise.all(promises);

    // Persist all images in one operation
    const savedArticleImages = await ArticleImage.create(articleImagesToSave);

    // Clean up 'tempFolderPath' directory now that all images have been processed
    await emptyDir(tempFolderPath);
    console.log('END INSIDE "processEmbeddedImages"');
    return savedArticleImages.map(articleImage => articleImage.id);
  }
  console.log('END INSIDE "processEmbeddedImages"');
  return null;
};
