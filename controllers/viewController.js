const Article = require('../models/articleModel');
const catchAsync = require('../utils/catchAsync');
const { replaceImagePaths } = require('../utils/parseHtml');

const displayHomepage = catchAsync(async (request, response, next) => {
  console.log('displayHomepage() invoked');

  let articles = await Article.find({}).populate('embededImages');
  articles = articles.map(article => {
    article.content = decodeURIComponent(article.content);
    article.content = replaceImagePaths(
      article.content,
      process.env.EMBEDED_IMAGES_PATH + article.id,
      article.embededImages
    );
    return article;
  });

  response.status(200).render('homepage', {
    title: 'Homepage',
    articles
  });
});

module.exports = { displayHomepage };
