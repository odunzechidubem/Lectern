import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/userModel.js';
import Course from './models/courseModel.js';
import Message from './models/messageModel.js';
import Notification from './models/notificationModel.js';

const userSocketMap = new Map();

export const initSocketServer = (server) => {
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const io = new Server(server, {
    cors: {
      origin: frontendURL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) return next(new Error('Authentication error: No cookie provided.'));
      const token = cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
      if (!token) return next(new Error('Authentication error: Token not found in cookie.'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.userId).select('-password');
      if (!socket.user) return next(new Error('Authentication error: User not found.'));
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.user.name} (${socket.id})`);
    userSocketMap.set(socket.user._id.toString(), socket.id);
    socket.on('joinCourse', async (courseId) => { /* ... */ });
    socket.on('sendMessage', async ({ courseId, content }) => { /* ... */ });
    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.user.name} (${socket.id})`);
      userSocketMap.delete(socket.user._id.toString());
    });
  });

  return { io, userSocketMap };
};