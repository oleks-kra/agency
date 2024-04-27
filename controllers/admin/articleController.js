const Article = require('../../models/articleModel');
const Category = require('../../models/categoryModel');
const catchAsync = require('../../utils/catchAsync');
const {
  replaceImagePaths,
  createCoverImage
} = require('../../utils/parseHtml');

const getForm = catchAsync(async (request, response, next) => {
  console.log('getForm() invoked');

  let article = {
    title: '',
    metaTitle: '',
    metaDescription: '',
    summary: '',
    content: ''
  };

  // 'allCategories' stores a full list of categories of the blog
  let allCategories;
  // 'assignedCategoryIds' stores just an array of ObjectId strings the article already belogins to
  let assignedCategoryIds;
  // if we are updating the article
  if (request.params.id) {
    // 1. get article details
    article = await Article.findById({
      _id: request.params.id
    })
      // get the 'title' field only, the _id comes automatically
      .populate('categories', 'title')
      .exec();

    // decode html from article's content
    article.content = decodeURIComponent(article.content);

    // reference ids of categories this article already belongs to
    assignedCategoryIds = article
      .populated('categories')
      .map(objectId => objectId.toString());

    // fetch a full list of categories present on the blog
    allCategories = await Category.find({}, 'title').exec();
  }

  // let Pug template know which action we want our client-side script to perform by updating the data attribute of the html form <form data-action="">
  response.locals.action = request.params.id ? 'update' : 'create';

  // character length limits for article's meta data
  const metaDataLengthLimits = {
    metaTitle: Number(process.env.MAX_META_TITLE_LENGTH),
    metaDescription: Number(process.env.MAX_META_DESCRIPTION_LENGTH)
  };

  // required fields for the article (In Pug, displays an asterist next to each required field)
  const requiredArticleFields = process.env.REQUIRED_ARTICLE_FIELDS.split(',');

  response.status(200).render('admin/blog/articleForm', {
    title: request.params.id ? 'Update an article' : 'Create an article',
    article,
    allCategories,
    assignedCategoryIds,
    metaDataLengthLimits,
    requiredArticleFields
  });
});

const getAll = catchAsync(async (request, response, next) => {
  console.log('getAll() invoked');

  const articles = await Article.find({}).exec();

  response.status(200).render('admin/blog/allArticles', {
    title: 'A list of all articles',
    articles
  });
});

const getOne = catchAsync(async (request, response, next) => {
  console.log('getOne() invoked');

  const article = await Article.findById({
    _id: request.params.id
  })
    .populate('featuredImage')
    .populate('categories', 'title slug')
    .populate('embededImages')
    .exec();

  console.log('article:', article);

  // ARTICLE BODY (content)

  // decode article's content back into regular HTML
  article.content = decodeURIComponent(article.content);
  // replace filenames with true image paths
  article.content = replaceImagePaths(
    article.content,
    process.env.EMBEDED_IMAGES_PATH + article.id,
    article.embededImages
  );

  // HEADER IMAGE
  if (article.featuredImage) {
    article.coverImage = createCoverImage(
      process.env.ARTICLE_FEATURED_IMAGES_PATH + article.id,
      article.featuredImage
    );
  }

  response.status(200).render('admin/blog/oneArticle', {
    title: 'A single article',
    article
  });
});

module.exports = {
  getForm,
  getAll,
  getOne
};
