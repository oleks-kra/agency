const mongoose = require('mongoose');

const articleCoverImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'An must have a filename.'],
    trim: true
  },
  height: Number,
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    unique: [
      true,
      'There cannot be more than one image cover associated with the same article.'
    ],
    required: [
      true,
      'Image must come with an ID of an article it is associated with.'
    ]
  },
  sizes: [
    {
      width: Number,
      flnm: String // image-480w.jpg
    }
  ]
});

const ArticleCoverImage = mongoose.model(
  'ArticleCoverImage',
  articleCoverImageSchema
);

module.exports = ArticleCoverImage;
