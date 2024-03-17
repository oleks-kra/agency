const multer = require('multer');
const path = require('path');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const isImageWideEnough = require('../../utils/isImageWideEnough');
const { clearDirectory } = require('../../utils/fileSystem');
const createImages = require('../../utils/createImages');
const { isValidObjectId } = require('../../utils/helpers');

// Save file to memory so we can re-size it before storing it on the server. File info will contain a field named 'bugger' that stores the entire file
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

  // ensure image is wide enough
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

  const directoryPath = path.join(
    __dirname,
    '../../public/img/blog/article/covers/',
    request.params.id
  );

  // if a new image cover is being uploaded, clear the contents of the existing folder before adding new images
  await clearDirectory(directoryPath);

  // come up with new name for the image as it will be saved in our DB
  const newName = `${Date.now()}-${request.file.originalname.split('.')[0]}.jpg`;

  // store multiple versions of an image cover on server
  const ratio = parseFloat(process.env.IMAGE_RATIO, 10) || 0.5625;
  const width = parseInt(process.env.ARTICLE_FEATURED_IMAGE_WIDTH, 10) || 1200;
  const resizeOptions = {
    width: width,
    height: parseInt(width * ratio, 10)
  };

  await createImages(
    request.file.buffer,
    directoryPath,
    newName,
    resizeOptions
  );

  // mount new image name 'newName' on request so that the next middleware has access to it
  request.file.newName = newName;

  // pass control to function that saves image filename to DB
  next();
});

module.exports = {
  processMultipartFormData,
  resizeImage
};
