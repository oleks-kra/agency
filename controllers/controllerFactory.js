const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { makeDirectory } = require('../utils/fileSystem');
const { filterRequestBody } = require('../utils/filterRequestBody');
const processEmbeddedImages = require('../utils/processEmbeddedImages');

// api/v1/resource/:id
const deleteOne = Model =>
  catchAsync(async (request, response, next) => {
    console.log('deleteOne() invoked');

    const doc = await Model.findByIdAndDelete({
      _id: request.params.id
    }).exec();

    if (!doc) {
      return next(
        new AppError(
          "Sorry, we couldn't delete the resource as it doesn't exist in our records. Please make sure you've entered the correct resource ID.",
          404
        )
      );
    }

    // when article is deleted, we do the clean up in post-hook query middleware

    response.status(200).json({
      status: 'success',
      data: null
    });
  });

// api/v1/resource/:id
const updateOne = Model =>
  catchAsync(async (request, response, next) => {
    console.log('updateOne() invoked');

    // filter request body depending on the type of resource we are to create
    let update;
    if (Model.modelName === 'Article') {
      update = filterRequestBody(
        request.body,
        'title',
        'content', // value of 'content' is escaped
        'summary',
        'metaDescription',
        'categories',
        'published',
        'embededArticleImages' // just so I can grab this array in the pre-hook; can be an empty stringified array if no new images were added
      );

      console.log('update.embededArticleImages', update.embededArticleImages);

      // FormData sent by front-end JavaScript might have request.body.categories in the form of a JSON string. If that's the case, we need to parse it back into object representation
      if (
        request.body.categories &&
        typeof request.body.categories === 'string'
      )
        update.categories = JSON.parse(request.body.categories);

      // if previous middlewares (only for article UPDATES) mounted an image to 'request.file'
      if (request.file) {
        update.featuredImage = request.file.newName;
      }
    }

    if (Model.modelName === 'Category') {
      update = filterRequestBody(
        request.body,
        'title',
        'description',
        'metaDescription',
        'published'
      );
    }

    // pre-hook query middleware handles image embeds processing
    const doc = await Model.findByIdAndUpdate(
      {
        _id: request.params.id
      },
      update,
      {
        returnDocument: 'after',
        runValidators: true
      }
    ).exec();

    if (!doc) {
      return next(
        new AppError(
          "Sorry, we couldn't update the resource. It seems that the resource you're trying to update doesn't exist in our records. Please make sure you've entered the correct resource ID and try again.",
          404
        )
      );
    }

    response.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

// NOTE:
const createOne = Model =>
  catchAsync(async (request, response, next) => {
    console.log('createOne() invoked');

    // filter request body depending on the type of resource we are to create
    let filteredBody;
    if (Model.modelName === 'Article') {
      filteredBody = filterRequestBody(
        request.body,
        'title',
        'content',
        'summary',
        'metaDescription'
      );
    }
    if (Model.modelName === 'Category') {
      filteredBody = filterRequestBody(
        request.body,
        'title',
        'description',
        'metaDescription'
      );
    }

    // create Mongoose document instance without saving
    const doc = new Model(filteredBody);

    // ensure the document validates before creating a new directory
    await doc.validate();

    if (Model.modelName === 'Article') {
      // ARTICLE COVER
      // Article image cover is only added when article is updated. Here, we just create a directory to store the article's cover image
      const articleCoverDir = path.join(
        __dirname,
        '../public/img/blog/article/covers/',
        doc.id
      );
      await makeDirectory(articleCoverDir);

      // ARTICLE EMBEDDED IMAGES
      // Create directory to store images (done once for each article, even if no images are passed)
      const articleEmbededImagesDir = path.join(
        __dirname,
        '../public/img/blog/article/embeds/',
        doc.id,
        '/'
      );
      await makeDirectory(articleEmbededImagesDir);
      // reference location of temporary folder for embeded images
      const tempFolderPath = path.join(
        __dirname,
        '../public/img/blog/article/embeds/temp/'
      );
      console.log('BEFORE "processEmbeddedImages"');
      // process embeded article images and get their _ids as an array
      const embededImageIds = await processEmbeddedImages(
        JSON.parse(request.body.embededArticleImages),
        tempFolderPath,
        articleEmbededImagesDir,
        doc
      );
      console.log('ATFTER "processEmbeddedImages"');
      // store IDs of images from the 'ArticleImages' collection as property of the article
      if (
        embededImageIds instanceof Array &&
        embededImageIds.every(value => mongoose.isValidObjectId(value))
      ) {
        doc.embededImages = embededImageIds;
      }
    }

    // if we got this far, covers directory was created, and all article embeds were stored and saved to db
    await doc.save();

    response.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

const getOne = Model =>
  catchAsync(async (request, response, next) => {
    console.log('getOne() invoked');

    const doc = await Model.findOne({
      slug: request.params.slug
    }).exec();

    if (!doc) {
      return next(
        new AppError(
          "Sorry, we couldn't find the resource you're looking for. Please double-check the URL or try again later.",
          404
        )
      );
    }

    // if we are working with an Article model, populate the article document 'doc' with references (e.g. 'categores' field)
    if (Model.modelName === 'Article') {
      await doc.populate('categories', 'title slug');
    }

    response.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

const getAll = Model =>
  catchAsync(async (request, response, next) => {
    console.log('getAll() invoked');

    const docs = await Model.find({}).exec();

    response.status(200).json({
      status: 'success',
      length: docs.length,
      data: {
        docs
      }
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
