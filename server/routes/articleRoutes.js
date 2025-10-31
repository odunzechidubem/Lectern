// /server/routes/articleRoutes.js (Definitive Final Version)

import express from 'express';
const router = express.Router();
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// GET all articles (public), POST a new article (admin only)
router.route('/')
  .get(getArticles)
  .post(protect, isAdmin, createArticle);

// PUT (update) and DELETE an article by ID (admin only)
router.route('/:id')
  .put(protect, isAdmin, updateArticle)
  .delete(protect, isAdmin, deleteArticle);

export default router;