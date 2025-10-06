import express from 'express';
import {
  getMyNotifications,
  markNotificationsAsRead,
  markOneAsRead,
  createAndEmitNotification,
} from '../controllers/notificationController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, isUser, getMyNotifications)
  .post(protect, createAndEmitNotification);

router.route('/mark-read').put(protect, isUser, markNotificationsAsRead);
router.route('/:id/mark-read').put(protect, isUser, markOneAsRead);

export default router;
