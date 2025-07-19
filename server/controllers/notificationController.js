import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// @desc    Get all unread notifications for the logged-in user
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id, isRead: false })
    .sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// @desc    Mark all of a user's notifications as read (We'll keep this for potential future features)
const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ message: 'Notifications marked as read' });
});

// --- NEW FUNCTION ---
// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/mark-read
// @access  Private
const markOneNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  // Check if the notification exists and belongs to the user
  if (notification && notification.user.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } else {
    res.status(404);
    throw new Error('Notification not found or user not authorized');
  }
});

export { getMyNotifications, markNotificationsAsRead, markOneNotificationAsRead };