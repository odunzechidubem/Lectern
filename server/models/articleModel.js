import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicPages: { type: Number, required: true, default: 1 },
    
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model('Article', articleSchema);
export default Article;