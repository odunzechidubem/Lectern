// /server/models/articleModel.js

import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true }, // <-- ADDED THIS LINE
    publicPages: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Public pages must be at least 1.'],
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model('Article', articleSchema);

export default Article;