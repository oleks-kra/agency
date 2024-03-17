const path = require('path');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  makeDirectory,
  clearDirectory,
  deleteDirectory
} = require('../utils/fileSystem');
const { filterRequestBody } = require('../utils/filterRequestBody');

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

    // when article is deleted, we also delete its covers folder with images
    if (Model.modelName === 'Article') {
      const directoryPath = path.join(
        __dirname,
        '../public/img/blog/article/covers/',
        doc.id
      );

      // clear directory's contents
      await clearDirectory(directoryPath);

      // delete directory itself
      await deleteDirectory(directoryPath);
    }

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
        'content',
        'summary',
        'metaDescription',
        'categories',
        'published'
      );

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

    // when article is created, a new directory is created to store its cover images
    if (Model.modelName === 'Article') {
      // attempt creating a directory to store article's cover image
      const directoryPath = path.join(
        __dirname,
        '../public/img/blog/article/covers/',
        doc.id
      );
      await makeDirectory(directoryPath);
    }

    // if we got this far, the directory has indeed been created
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
