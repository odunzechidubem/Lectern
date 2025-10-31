// /server/controllers/articleController.js (Definitive Final Version)

import asyncHandler from 'express-async-handler';
import Article from '../models/articleModel.js';
import cloudinary from '../config/cloudinary.js'; // <-- Import Cloudinary

const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({}).sort({ createdAt: 'desc' });
  res.status(200).json(articles);
});

const createArticle = asyncHandler(async (req, res) => {
  // --- THIS IS THE FIX ---
  // Destructure the new filePublicId from the request body.
  const { title, description, fileUrl, filePublicId, publicPages, contactEmail, contactPhone } = req.body;

  if (!title || !description || !fileUrl || !filePublicId || !publicPages || !contactEmail || !contactPhone) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const article = await Article.create({
    title: title.trim(),
    description: description.trim(),
    fileUrl,
    filePublicId, // Now included when creating the document
    publicPages,
    contactEmail,
    contactPhone,
  });

  res.status(201).json(article);
});

const updateArticle = asyncHandler(async (req, res) => {
  // This function is also updated for completeness, in case you ever allow file updates.
  const { title, description, fileUrl, filePublicId, publicPages, contactEmail, contactPhone } = req.body;
  const article = await Article.findById(req.params.id);

  if (article) {
    article.title = title || article.title;
    article.description = description || article.description;
    article.fileUrl = fileUrl || article.fileUrl;
    if (filePublicId) { // Only update publicId if a new one is provided
        article.filePublicId = filePublicId;
    }
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
    // --- THIS IS THE FIX ---
    // If the article has a filePublicId, delete it from Cloudinary first.
    if (article.filePublicId) {
      try {
        await cloudinary.uploader.destroy(article.filePublicId, { resource_type: 'raw' });
      } catch (err) {
        console.error("Failed to delete article asset from Cloudinary. Continuing with DB deletion.", err);
      }
    }

    await article.deleteOne();
    res.status(200).json({ message: 'Article deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Article not found');
  }
});

export { getArticles, createArticle, updateArticle, deleteArticle };