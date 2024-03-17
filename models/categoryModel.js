const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A category must have a title.'],
      unique: [true, "Category's title must be unique."],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    description: {
      type: String,
      trim: true
    },
    published: {
      type: Boolean,
      default: false
    },
    metaDescription: {
      type: String,
      required: [true, 'A category must have a meta description.'],
      trim: true
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
categorySchema.pre('save', function (next) {
  console.log('save middleware invoked');
  this.slug = slugify(this.title, { lower: true });
  next();
});

// query
categorySchema.pre('findOneAndUpdate', function (next) {
  console.log('findOneAndUpdate middleware invoked');
  // if article comes with a new 'title,' update its 'slug'
  const title = this.get('title');
  if (title) {
    this.set('slug', slugify(title, { lower: true }));
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
