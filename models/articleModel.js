const mongoose = require('mongoose');
const slugify = require('slugify');
const path = require('path');
const ArticleImage = require('./articleImages');
const {
  deleteFile,
  clearDirectory,
  deleteDirectory
} = require('../utils/fileSystem');
const { parseEmbeddedImagesFromHTML } = require('../utils/parseHtml');
const processEmbeddedImages = require('../utils/processEmbeddedImages');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An article must have a title.'],
      unique: [true, "Article's title must be unique."],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    categories: [
      // When I update an article, all _ids we store here must be document _ids from the Category model.
      {
        type: 'ObjectId', // Alternatively: Schema.Types.ObjectId
        ref: 'Category'
      }
    ],
    content: {
      type: String,
      required: [true, 'An article must have a body.'],
      trim: true
    },
    summary: {
      type: String,
      required: [true, 'An article must have a summary.'],
      trim: true
    },
    featuredImage: {
      type: String
    },
    embededImages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArticleImage'
      }
    ],
    published: {
      type: Boolean,
      default: false
    },
    metaDescription: {
      type: String,
      required: [true, 'An article must have a meta description.'],
      trim: true,
      maxLength: [
        166,
        "An article's meta description must be 166 or fewer characters long."
      ]
    },
    slug: {
      type: String,
      lowercase: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
  }
);

// PRE-MIDDLEWARES

// document
articleSchema.pre('save', function (next) {
  console.log('save middleware invoked');
  this.slug = slugify(this.title, { lower: true });
  next();
});

// query
articleSchema.pre('findOneAndUpdate', async function (next) {
  console.log(
    `The "findOneAndUpdate" PRE-middleware invoked. Operation name: ${this.op}`
  );
  // SLUG
  // if article comes with a new 'title,' update its 'slug'
  // 'query.get(path)' - returns the value of the stated path in the update's $set
  const title = this.get('title');
  if (title) {
    this.set('slug', slugify(title, { lower: true }));
  }

  // CHECK IF VALUE OF 'CONTENT' HAS CHANGED
  const update = this.getUpdate(); // get the update object
  const currentArticle = await this.model
    .findOne(this.getQuery())
    .populate('embededImages')
    .exec(); // retrieve current article document as stored in the database
  if (
    update.content !== undefined &&
    update.content !== currentArticle.content
  ) {
    // the value of 'this.isContentChanged' is read in post-hook query
    this.isContentChanged = true;
    // 'this.embededArticleImages' stores newly added image embeds, as stringified JSON. If no images were embeded, it is an empty stringified array
    this.embededArticleImages = update.embededArticleImages;
    // 'this.persistedArticleImages' is an array of documents from the 'ArticleImages' collection associated with the article we are updating
    this.persistedArticleImages = currentArticle.embededImages;
  }
  next();
});

// POST-MIDDLEWARES

// query
articleSchema.post('findOneAndUpdate', async function (updatedArticle, next) {
  // Log the invocation of the post-middleware
  console.log(
    `The "findOneAndUpdate" POST-middleware invoked. Operation name: ${this.op}`
  );

  // Check if the content of the article has been changed
  if (this.isContentChanged) {
    // Flag to track if the document has been changed and needs to be saved
    let isDocumentChanged = false;

    // Path to the folder where article images are stored
    const articleImagesPath = path.join(
      __dirname,
      '../public/img/blog/article/embeds/',
      updatedArticle.id,
      '/'
    );

    // Temporary folder path for processing images
    const tempFolderPath = path.join(
      __dirname,
      '../public/img/blog/article/embeds/temp/'
    );

    // Process old images
    const { persistedArticleImages } = this; // Get persisted article images
    const imagesInHtml = parseEmbeddedImagesFromHTML(
      // Parse HTML content to get images
      decodeURIComponent(updatedArticle.content)
    );
    let idsOfArticleImagesToDelete = []; // Array to store IDs of images (as ObjectIDs) to delete
    await Promise.all(
      persistedArticleImages.map(async persistedImage => {
        const { _id, filename } = persistedImage;
        if (!imagesInHtml.includes(filename)) {
          // Check if image is no longer in the HTML content
          const pathToImage = articleImagesPath + filename;
          console.log('pathToImage:', pathToImage);
          await deleteFile(pathToImage); // Delete image from server
          idsOfArticleImagesToDelete.push(_id); // Store ObjectID of image to delete
        }
      })
    );

    // Remove images from the ArticleImages collection
    if (idsOfArticleImagesToDelete.length > 0) {
      isDocumentChanged = true; // Set flag to indicate document change
      const query = { _id: { $in: idsOfArticleImagesToDelete } };
      await ArticleImage.deleteMany(query);
    }

    // Turn ObjectIDs objects into ObjectID strings
    idsOfArticleImagesToDelete = idsOfArticleImagesToDelete.map(objectId =>
      objectId.toString()
    );

    // Update the array of image ObjectIds in the article document
    updatedArticle.embededImages = updatedArticle.embededImages.filter(
      objectId => !idsOfArticleImagesToDelete.includes(objectId.toString())
    );

    // Process new image uploads
    const savedImageIds = await processEmbeddedImages(
      // Move and persist new images
      JSON.parse(this.embededArticleImages),
      tempFolderPath,
      articleImagesPath,
      updatedArticle
    );

    // Update the array of image ObjectIds in the article document
    if (savedImageIds instanceof Array) {
      isDocumentChanged = true; // Set flag to indicate document change
      updatedArticle.embededImages = [
        ...updatedArticle.embededImages,
        ...savedImageIds
      ];
    }

    // Persist changes if document has been modified
    if (!isDocumentChanged) return; // No changes, return early
    console.log('Extra save was needed!');
    await updatedArticle.validate('embededImages'); // Validate embededImages field
    await updatedArticle.save(); // Save the updated article document
  }

  // If there are other post-hook queries to be run, pass the controlls
  next();
});

// Once an article is deleted, we need to run the clean up process
articleSchema.post('findOneAndDelete', async function (deletedArticle, next) {
  console.log(`The "findOneAndDelete" POST-middleware invoked.`);
  // 1. Delete article's cover directory
  const articleCoverPath = path.join(
    __dirname,
    '../public/img/blog/article/covers/',
    deletedArticle.id,
    '/'
  );
  await clearDirectory(articleCoverPath);
  await deleteDirectory(articleCoverPath);
  // 2. Delete article's embeds folder
  const articleEmbedsPath = path.join(
    __dirname,
    '../public/img/blog/article/embeds/',
    deletedArticle.id,
    '/'
  );
  await clearDirectory(articleEmbedsPath);
  await deleteDirectory(articleEmbedsPath);
  // 3. Delete documents 'ArticleImages' documents where 'articleId' matches deletedArticle.id
  await ArticleImage.deleteMany({
    articleId: deletedArticle._id
  });
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
