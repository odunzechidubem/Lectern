import express from 'express';
const router = express.Router();
import {
  getMyNotifications,
  markNotificationsAsRead,
  markOneAsRead,
} from '../controllers/notificationController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';

router.route('/').get(protect, isUser, getMyNotifications);
router.route('/mark-read').put(protect, isUser, markNotificationsAsRead);
router.route('/:id/mark-read').put(protect, isUser, markOneAsRead);

export default router;