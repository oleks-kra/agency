const Article = require('../../models/articleModel');
const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne
} = require('../controllerFactory');

const createArticle = createOne(Article);
const getArticles = getAll(Article);
const getArticle = getOne(Article);
const deleteArticle = deleteOne(Article);
const updateArticle = updateOne(Article);

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  deleteArticle,
  updateArticle
};
