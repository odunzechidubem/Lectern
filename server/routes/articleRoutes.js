import express from 'express';
const router = express.Router();
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

router.route('/').get(getArticles).post(protect, isAdmin, createArticle);
router.route('/:id').put(protect, isAdmin, updateArticle).delete(protect, isAdmin, deleteArticle);

export default router;