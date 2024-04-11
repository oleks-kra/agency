const Article = require('../../models/articleModel');
const Category = require('../../models/categoryModel');
const catchAsync = require('../../utils/catchAsync');
const { replaceImagePaths } = require('../../utils/parseHtml');

const getForm = catchAsync(async (request, response, next) => {
  console.log('getForm() invoked');

  let article = {
    title: '',
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
    console.log('decoded article content:', article.content);
    // reference ids of categories this article already belongs to
    assignedCategoryIds = article
      .populated('categories')
      .map(objectId => objectId.toString());

    // get all available category IDs as an array of ObjectId strings
    allCategories = await Category.find({}, 'title').exec();
  }

  // let Pug template know which action we want our client-side script to perform by appending it form's dataset attribute
  response.locals.action = request.params.id ? 'update' : 'create';

  response.status(200).render('admin/blog/articleForm', {
    title: request.params.id ? 'Update an article' : 'Create an article',
    article,
    allCategories,
    assignedCategoryIds
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
    .populate('categories', 'title slug')
    .exec();

  // decode article's content back into regular HTML
  article.content = decodeURIComponent(article.content);
  // replace filenames with true image paths
  const replaced = replaceImagePaths(
    article.content,
    process.env.EMBEDED_IMAGES_PATH + article.id
  );
  console.log('replaced:', replaced);
  article.content = replaced;
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
