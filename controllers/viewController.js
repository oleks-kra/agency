const Article = require('../models/articleModel');
const catchAsync = require('../utils/catchAsync');
const { replaceImagePaths, createCoverImage } = require('../utils/parseHtml');

const displayHomepage = catchAsync(async (request, response, next) => {
  console.log('displayHomepage() invoked');

  let articles = await Article.find({})
    .populate('embededImages')
    .populate('featuredImage');
  articles = articles.map(article => {
    // ARTICLE CONTENT
    article.content = decodeURIComponent(article.content);
    article.content = replaceImagePaths(
      article.content,
      process.env.EMBEDED_IMAGES_PATH + article.id,
      article.embededImages
    );

    // ARTICLE FEATURED IMAGE
    if (article.featuredImage) {
      article.coverImage = createCoverImage(
        process.env.ARTICLE_FEATURED_IMAGES_PATH + article.id,
        article.featuredImage
      );
    }
    return article;
  });

  response.status(200).render('homepage', {
    title: 'Homepage',
    articles
  });
});

module.exports = { displayHomepage };
