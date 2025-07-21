import express from 'express';
const router = express.Router();
import {
  getFooterLinks,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
} from '../controllers/footerLinkController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Public route to get all links
router.route('/').get(getFooterLinks);

// Admin-only route to create a new link
router.route('/').post(protect, isAdmin, createFooterLink);

// Admin-only routes to update and delete a specific link
router.route('/:id')
  .put(protect, isAdmin, updateFooterLink)
  .delete(protect, isAdmin, deleteFooterLink);

export default router;