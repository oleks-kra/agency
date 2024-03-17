const mongoose = require('mongoose');
const slugify = require('slugify');

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
articleSchema.pre('findOneAndUpdate', function (next) {
  console.log('findOneAndUpdate middleware invoked');
  // if article comes with a new 'title,' update its 'slug'
  const title = this.get('title');
  if (title) {
    this.set('slug', slugify(title, { lower: true }));
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
