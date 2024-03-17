const Article = require('../models/articleModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const displayHomepage = catchAsync(async (request, response, next) => {
  console.log('displayHomepage() invoked');

  const articles = await Article.find({});

  console.log('Articles retrieved:', articles);

  response.status(200).render('homepage', {
    title: 'Homepage',
    articles
  });
});

module.exports = { displayHomepage };
