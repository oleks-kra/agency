const Category = require('../../models/categoryModel');
const catchAsync = require('../../utils/catchAsync');
//const AppError = require('../../utils/appError');

const getForm = catchAsync(async (request, response, next) => {
  console.log('getForm() invoked');

  let category = {
    title: '',
    description: '',
    metaDescription: ''
  };

  if (request.params.id) {
    category = await Category.findById({
      _id: request.params.id
    }).exec();
  }

  // let Pug template know which action we want our client-side script to perform by appending it form's dataset attribute
  response.locals.action = request.params.id ? 'update' : 'create';

  response.status(200).render('admin/blog/categoryForm', {
    title: request.params.id ? 'Update a category' : 'Create a category',
    category
  });
});

const getAll = catchAsync(async (request, response, next) => {
  console.log('getAll() invoked');

  const categories = await Category.find({}).exec();

  response.status(200).render('admin/blog/allCategories', {
    title: 'A list of all categories',
    categories
  });
});

const getOne = catchAsync(async (request, response, next) => {
  console.log('getOne() invoked');

  const category = await Category.findById({
    _id: request.params.id
  }).exec();

  response.status(200).render('admin/blog/oneCategory', {
    title: 'A single category',
    category
  });
});

module.exports = {
  getForm,
  getAll,
  getOne
};
