import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // The user who the notification is FOR
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // The content of the notification
    message: {
      type: String,
      required: true,
    },
    // A link to navigate to when the notification is clicked
    link: {
      type: String,
      required: true,
    },
    // Status to track if the user has seen it
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;