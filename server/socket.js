import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/userModel.js';
import Course from './models/courseModel.js';
import Message from './models/messageModel.js';
import Notification from './models/notificationModel.js';

// This map will store active users: { userId: socket.id }
const userSocketMap = new Map();

export const initSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) return next(new Error('Authentication error: No cookie'));
      const token = cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
      if (!token) return next(new Error('Authentication error: No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.userId).select('-password');
      if (!socket.user) return next(new Error('Authentication error: User not found'));
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.user.name} (${socket.id})`);
    // Add user to our map when they connect
    userSocketMap.set(socket.user._id.toString(), socket.id);

    socket.on('joinCourse', async (courseId) => {
      const course = await Course.findById(courseId);
      if (!course) return;
      const isLecturer = course.lecturer.toString() === socket.user._id.toString();
      const isEnrolled = course.students.some(s => s.toString() === socket.user._id.toString());
      if (isLecturer || isEnrolled) {
        socket.join(courseId);
        console.log(`${socket.user.name} joined room: ${courseId}`);
      }
    });

    socket.on('sendMessage', async ({ courseId, content }) => {
      if (!content || !courseId) return;
      try {
        const message = await Message.create({ course: courseId, sender: socket.user._id, content });
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage');
        io.to(courseId).emit('newMessage', populatedMessage);
        const course = await Course.findById(courseId);
        if (!course) return;
        const participants = [course.lecturer, ...course.students];
        const recipients = participants.filter((p) => p.toString() !== socket.user._id.toString());
        if (recipients.length > 0) {
          const notificationMessage = `${socket.user.name} sent a new message in "${course.title}".`;
          const link = `/course/${courseId}/chat`;
          const notifications = recipients.map(userId => ({ user: userId, message: notificationMessage, link }));
          await Notification.insertMany(notifications);
          recipients.forEach(userId => {
            const socketId = userSocketMap.get(userId.toString());
            if (socketId) {
              io.to(socketId).emit('newNotification');
            }
          });
          console.log(`Created and Pushed ${notifications.length} chat notifications.`);
        }
      } catch (error) {
        console.error('Error in sendMessage handler:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.user.name} (${socket.id})`);
      // Remove user from map on disconnect
      userSocketMap.delete(socket.user._id.toString());
    });
  });

  // Return the io instance and the user map so they can be used in our controllers
  return { io, userSocketMap };
};