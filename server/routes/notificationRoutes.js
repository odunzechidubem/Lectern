import express from 'express';
const router = express.Router();
import {
  getMyNotifications,
  markNotificationsAsRead,
} from '../controllers/notificationController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';

// GET /api/notifications - Get my unread notifications
router.route('/').get(protect, isUser, getMyNotifications);

// PUT /api/notifications/mark-read - Mark all as read
router.route('/mark-read').put(protect, isUser, markNotificationsAsRead);

export default router;