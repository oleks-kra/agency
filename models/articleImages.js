const mongoose = require('mongoose');

const articleImagesSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'An must have a filename.'],
    unique: [true, 'An image filename must be unique.'],
    trim: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
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

const ArticleImage = mongoose.model('ArticleImage', articleImagesSchema);

module.exports = ArticleImage;
