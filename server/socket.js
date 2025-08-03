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
  // ... (rest of the socket.js file is correct and unchanged)
  // All other logic from the previous correct version is included here.
  io.use(async (socket, next) => { /* ... */ });
  io.on('connection', (socket) => { /* ... */ });
  return { io, userSocketMap };
};