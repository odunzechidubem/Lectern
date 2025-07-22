import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/userModel.js';
import Course from './models/courseModel.js';
import Message from './models/messageModel.js';
import Notification from './models/notificationModel.js';

export const initSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) {
        return next(new Error('Authentication error: No cookie provided.'));
      }
      // Robustly parse the cookie string to find the jwt token
      const token = cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
      if (!token) {
        return next(new Error('Authentication error: Token not found in cookie.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.userId).select('-password');
      if (!socket.user) {
        return next(new Error('Authentication error: User not found.'));
      }
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.user.name} (${socket.id})`);

    // Handler for when a user joins a course-specific chat
    socket.on('joinCourse', async (courseId) => {
      // Security Check: User must be lecturer or enrolled student
      const course = await Course.findById(courseId);
      if (!course) return;

      const isLecturer = course.lecturer.toString() === socket.user._id.toString();
      const isEnrolled = course.students.some(s => s.toString() === socket.user._id.toString());

      if (isLecturer || isEnrolled) {
        socket.join(courseId);
        console.log(`${socket.user.name} joined room: ${courseId}`);
      }
    });

    // Handler for when a user sends a message
    socket.on('sendMessage', async ({ courseId, content }) => {
      if (!content || !courseId) return;

      try {
        // 1. Save the message to the database
        const message = await Message.create({
          course: courseId,
          sender: socket.user._id,
          content,
        });

        // 2. Populate the sender's details for the chat UI
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage');
        
        // 3. THIS IS THE FIX: Broadcast the new message to everyone in the room
        io.to(courseId).emit('newMessage', populatedMessage);

        // 4. Create notifications for all OTHER participants in the room
        const course = await Course.findById(courseId);
        if (!course) return;

        const participants = [course.lecturer, ...course.students];
        const recipients = participants.filter(
          (p) => p.toString() !== socket.user._id.toString()
        );

        if (recipients.length > 0) {
          const notificationMessage = `${socket.user.name} sent a new message in "${course.title}".`;
          const link = `/course/${courseId}/chat`;
          
          const notifications = recipients.map(userId => ({
            user: userId,
            message: notificationMessage,
            link,
          }));

          await Notification.insertMany(notifications);
          console.log(`Created ${notifications.length} chat notifications.`);
        }

      } catch (error) {
        console.error('Error in sendMessage handler:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};