const Category = require('../../models/categoryModel');
const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne
} = require('../controllerFactory');

const createCategory = createOne(Category);
const getCategories = getAll(Category);
const getCategory = getOne(Category);
const deleteCategory = deleteOne(Category);
const updateCategory = updateOne(Category);

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory
};
