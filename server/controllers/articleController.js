// /server/controllers/articleController.js

import asyncHandler from 'express-async-handler';
import Article from '../models/articleModel.js';

const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({}).sort({ createdAt: 'desc' });
  res.status(200).json(articles);
});

const createArticle = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, publicPages, contactEmail, contactPhone } = req.body;

  // Corrected: Add more robust validation
  if (!title || !description || !fileUrl || !publicPages || !contactEmail || !contactPhone) {
    res.status(400);
    throw new Error('All fields are required');
  }

  // Corrected: Basic sanitization
  const article = await Article.create({
    title: title.trim(),
    description: description.trim(),
    fileUrl,
    publicPages,
    contactEmail,
    contactPhone,
  });

  res.status(201).json(article);
});

const updateArticle = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, publicPages, contactEmail, contactPhone } = req.body;
  const article = await Article.findById(req.params.id);

  if (article) {
    article.title = title || article.title;
    article.description = description || article.description;
    article.fileUrl = fileUrl || article.fileUrl;
    article.publicPages = publicPages || article.publicPages;
    article.contactEmail = contactEmail || article.contactEmail;
    article.contactPhone = contactPhone || article.contactPhone;

    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);
  } else {
    res.status(404);
    throw new Error('Article not found');
  }
});

const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (article) {
    await article.deleteOne();
    res.status(200).json({ message: 'Article deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Article not found');
  }
});

export { getArticles, createArticle, updateArticle, deleteArticle };