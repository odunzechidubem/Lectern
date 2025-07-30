import asyncHandler from 'express-async-handler';
import Article from '../models/articleModel.js';

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({}).sort({ createdAt: 'desc' });
  res.status(200).json(articles);
});

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, publicPages } = req.body;
  if (!title || !description || !fileUrl || !publicPages) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const article = await Article.create({ title, description, fileUrl, publicPages });
  res.status(201).json(article);
});

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, publicPages } = req.body;
  const article = await Article.findById(req.params.id);
  if (article) {
    article.title = title || article.title;
    article.description = description || article.description;
    article.fileUrl = fileUrl || article.fileUrl;
    article.publicPages = publicPages || article.publicPages;
    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);
  } else {
    res.status(404);
    throw new Error('Article not found');
  }
});

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (article) {
    // Note: This does not delete the file from Cloudinary, only the DB record.
    await article.deleteOne();
    res.status(200).json({ message: 'Article deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Article not found');
  }
});

export { getArticles, createArticle, updateArticle, deleteArticle };