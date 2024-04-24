const multer = require('multer');
const path = require('path');
const probe = require('probe-image-size');

const ArticleCoverImage = require('../../models/articleCoverImageModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const isImageWideEnough = require('../../utils/isImageWideEnough');
const { clearDirectory } = require('../../utils/fileSystem');
const { createUniqueImageFilename } = require('../../utils/misc');
const createResponsiveCovers = require('../../utils/createResponsiveCovers');
const tinyCreateImages = require('../../utils/tinyCreateImages');
const { isValidObjectId } = require('../../utils/helpers');

const bufferToStream = require('../../utils/bufferToStream');

// Save file to memory so we can re-size it before storing it on the server. File info will contain a field named 'buffer' that stores the entire file
const multerStorage = multer.memoryStorage();

// Accept only files that are image; skip others
const multerFilter = (request, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    // accept this file for an upload
    cb(null, true);
  } else {
    // mimetype is not an image, so skip uploading this file
    cb(
      new AppError(
        `The uploaded file (${file.mimetype}) is not an image.`,
        400
      ),
      false
    );
  }
};

// Returns a Multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format.
const upload = multer({
  // where to store the file
  storage: multerStorage,
  // control files that can be uploaded
  fileFilter: multerFilter
});

// saves image to memory storage at 'request.file.buffer', mounts form data at 'request.body', and mounts file info at 'request.file'
const processMultipartFormData = upload.single('featuredImage');

const resizeImage = catchAsync(async (request, response, next) => {
  console.log('resizeImage() invoked');

  if (!request.file) {
    // nothing to upload, pass controls to the next middleware in callstack
    return next();
  }

  // ensure request.params.id is a valid OjbectId value
  if (!isValidObjectId(request.params.id)) {
    console.log('Invalid article ID');
    return next(new AppError('Invalid article ID', 400));
  }

  // ensure image is wide enough, at 1200 pixels wide or wider
  const isWideEnough = await isImageWideEnough(
    request.file.buffer,
    process.env.ARTICLE_FEATURED_IMAGE_WIDTH
  );
  if (!isWideEnough) {
    return next(
      new AppError(
        `A featured image of an article must be at least ${process.env.ARTICLE_FEATURED_IMAGE_WIDTH}px wide.`
      )
    );
  }

  const coversDir = path.join(
    __dirname,
    '../../public/img/blog/article/covers/',
    request.params.id,
    '/'
  );
  console.log('coversDir:', coversDir);

  // if a new image cover is being uploaded, clear the contents of the existing folder before adding new images
  await clearDirectory(coversDir);

  // come up with new name for the image as it will be saved in our DB
  const newName = createUniqueImageFilename(request.file.originalname);

  // store multiple versions of an image cover on server
  const maxWidth =
    parseInt(process.env.ARTICLE_FEATURED_IMAGE_WIDTH, 10) || 1200;

  const widthSlots = process.env.ARTICLE_FEATURED_IMAGE_WIDTH_SLOTS.split(
    ','
  ).map(slot => Number(slot));

  const ratio = parseFloat(process.env.IMAGE_RATIO, 10) || 0.5625;
  const maxHeight = parseInt(maxWidth * ratio, 10);

  // 'createResponsiveCovers' creates multiple versions of the 'request.file.buffer' image and stores them all in the '/covers/article_id/*'
  const sizes = await createResponsiveCovers(
    request.file.buffer,
    coversDir,
    newName,
    widthSlots,
    maxWidth,
    maxHeight
  );

  // remove the existing document from 'ArticleCoverImage' before creating a new one
  await ArticleCoverImage.deleteOne({ articleId: request.params.id });

  // create a new one
  const coverImageDoc = await ArticleCoverImage.create({
    filename: newName,
    height: maxHeight,
    articleId: request.params.id,
    sizes
  });

  // mount new image name 'newName' on request so that the next middleware has access to it
  request.file.coverId = coverImageDoc.id;

  // pass control to function that saves image filename to DB
  next();
});

const tinyMultipartFormData = upload.single('file');

// 'tinyResizeImage()' is not called if article is submitted without embeded images
const tinyResizeImage = catchAsync(async (request, response, next) => {
  console.log('tinyResizeImage() invoked');

  if (!request.file) {
    console.log('Error: file is missing at request.file: tinyResizeImage()');
    return next(new AppError('file is missing at request.file', 400));
  }

  const tempImageStorageDirectory = path.join(
    __dirname,
    '../../public/img/blog/article/embeds/temp/'
  );

  // come up with new name for the image as it will be saved in our DB
  const newName = createUniqueImageFilename(request.file.originalname);
  await tinyCreateImages(
    request.file.buffer,
    tempImageStorageDirectory,
    newName
  );

  response.status(200).json({
    // whatever value is passed to 'location' will be used as image's 'src' attribute and stored in the DB for the article
    location: newName
  });

  // pass control to function that saves image filename to DB
  //next();
});

module.exports = {
  processMultipartFormData,
  resizeImage,
  tinyMultipartFormData,
  tinyResizeImage
};
