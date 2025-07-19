import express from 'express';
const router = express.Router();
import {
  createAnnouncement,
  getAnnouncementsForCourse,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, lecturer } from '../middleware/authMiddleware.js';

// POST /api/announcements - Create an announcement
router.route('/').post(protect, lecturer, createAnnouncement);

// GET /api/announcements/:courseId - Get all announcements for a course
router.route('/:courseId').get(protect, getAnnouncementsForCourse);

// DELETE /api/announcements/:id - Delete a specific announcement
router.route('/:id').delete(protect, lecturer, deleteAnnouncement);

export default router;