import express from 'express';
const router = express.Router();
import {
  createAnnouncement,
  getAnnouncementsForCourse,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, lecturer, isUser } from '../middleware/authMiddleware.js';

router.route('/').post(protect, lecturer, createAnnouncement);
router.route('/course/:courseId').get(protect, isUser, getAnnouncementsForCourse);
router.route('/:id').delete(protect, lecturer, deleteAnnouncement);

export default router;