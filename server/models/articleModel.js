import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    // The number of pages to show to the public
    publicPages: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model('Article', articleSchema);
export default Article;