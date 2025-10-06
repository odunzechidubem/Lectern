import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// @desc Get all unread notifications for the logged-in user
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id, isRead: false })
    .sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// @desc Mark all notifications as read
const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ message: 'Notifications marked as read' });
});

// @desc Mark one as read
const markOneAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification && notification.user.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } else {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }
});

// ✅ Real-time helper
const createAndEmitNotification = asyncHandler(async (req, res) => {
  const { userId, message, link } = req.body;
  if (!userId || !message || !link) {
    res.status(400);
    throw new Error('Missing fields');
  }

  const newNotif = await Notification.create({ user: userId, message, link });

  // Emit if user connected
  const socketId = req.userSocketMap?.get(userId.toString());
  if (socketId && req.io) {
    req.io.to(socketId).emit('new_notification_data', newNotif);
  }

  res.status(201).json(newNotif);
});

export {
  getMyNotifications,
  markNotificationsAsRead,
  markOneAsRead,
  createAndEmitNotification,
};
