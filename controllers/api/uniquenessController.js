const Article = require('../../models/articleModel');
const catchAsync = require('../../utils/catchAsync');

const getArticle = catchAsync(async (request, response, next) => {
  console.log('getArticle() invoked');

  const doc = await Article.findOne(
    {
      slug: request.params.slug
    },
    '_id'
  ).exec();

  // if data.doc === null, then document with this slug does not yet exist in the collection
  response.status(200).json({
    status: 'success',
    data: {
      doc
    }
  });
});

module.exports = {
  getArticle
};
