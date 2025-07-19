import express from 'express';
const router = express.Router();
import {
  getMyNotifications,
  markNotificationsAsRead,
  markOneNotificationAsRead, // <-- IMPORT
} from '../controllers/notificationController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';

// GET /api/notifications
router.route('/').get(protect, isUser, getMyNotifications);

// PUT /api/notifications/mark-read
router.route('/mark-read').put(protect, isUser, markNotificationsAsRead);

// PUT /api/notifications/:id/mark-read
router.route('/:id/mark-read').put(protect, isUser, markOneNotificationAsRead); // <-- ADD NEW ROUTE

export default router;