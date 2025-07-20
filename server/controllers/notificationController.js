import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// @desc    Get all unread notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id, isRead: false })
    .sort({ createdAt: -1 }); // Show newest first
  res.status(200).json(notifications);
});

// @desc    Mark all of a user's notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ message: 'Notifications marked as read' });
});

export { getMyNotifications, markNotificationsAsRead };