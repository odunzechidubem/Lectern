import { Server } from 'socket.io';

let io;
const userSocketMap = new Map(); // userId → socketId

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.DEV_FRONTEND_URL,   // e.g. http://localhost:5173
        process.env.FRONTEND_URL,       // e.g. https://lectern.site
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // When a user logs in, frontend emits this with userId
    socket.on('registerUser', (userId) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`✅ Registered user ${userId} → socket ${socket.id}`);
      }
    });

    // Private messaging or chat events
    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', { senderId, message });
        console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
      }
    });

    // Emit notification to specific user
    socket.on('sendNotification', ({ userId, message, link }) => {
      const socketId = userSocketMap.get(userId);
      if (socketId) {
        io.to(socketId).emit('newNotification', { message, link });
        console.log(`🔔 Notification sent to user ${userId}`);
      }
    });

    // Disconnect event
    socket.on('disconnect', () => {
      for (const [userId, id] of userSocketMap.entries()) {
        if (id === socket.id) {
          userSocketMap.delete(userId);
          console.log(`🔴 User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return { io, userSocketMap };
};




// // /server/socket.js

// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import User from './models/userModel.js';
// import Course from './models/courseModel.js';
// import Message from './models/messageModel.js';
// import Notification from './models/notificationModel.js';

// const userSocketMap = new Map();

// export const initSocketServer = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: [
//         process.env.DEV_FRONTEND_URL,
//         process.env.FRONTEND_URL
//       ].filter(Boolean),
//       credentials: true,
//     },
//   });

//   io.use(async (socket, next) => {
//     try {
//       const cookie = socket.handshake.headers.cookie;
//       if (!cookie) return next(new Error('Authentication error: No cookie provided.'));
//       const token = cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
//       if (!token) return next(new Error('Authentication error: Token not found in cookie.'));
      
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = await User.findById(decoded.userId).select('-password');
//       if (!socket.user) return next(new Error('Authentication error: User not found.'));
      
//       next();
//     } catch (error) {
//       next(new Error('Authentication error: Invalid token.'));
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log(`Socket Connected: ${socket.user.name} (${socket.id})`);
//     userSocketMap.set(socket.user._id.toString(), socket.id);

//     socket.on('joinCourse', async (courseId) => {
//       const course = await Course.findById(courseId);
//       if (!course) return;
      
//       const isLecturer = course.lecturer.toString() === socket.user._id.toString();
//       const isEnrolled = course.students.some(s => s.toString() === socket.user._id.toString());
      
//       if (isLecturer || isEnrolled) {
//         socket.join(courseId);
//         console.log(`${socket.user.name} joined room: ${courseId}`);
//       }
//     });

//     socket.on('sendMessage', async ({ courseId, content }) => {
//       if (!content || !courseId) return;
//       try {
//         const message = await Message.create({ course: courseId, sender: socket.user._id, content });
//         const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage');
//         io.to(courseId).emit('newMessage', populatedMessage);

//         const course = await Course.findById(courseId);
//         if (!course) return;

//         const participants = [course.lecturer, ...course.students];
//         const recipients = participants.filter(
//           (p) => p.toString() !== socket.user._id.toString()
//         );

//         if (recipients.length > 0) {
//           const notificationMessage = `${socket.user.name} sent a new message in "${course.title}".`;
//           const link = `/course/${courseId}/chat`;
          
//           const notificationDocs = recipients.map(userId => ({
//             user: userId,
//             message: notificationMessage,
//             link,
//           }));
          
//           const createdNotifications = await Notification.insertMany(notificationDocs);

//           createdNotifications.forEach(notification => {
//             const socketId = userSocketMap.get(notification.user.toString());
//             if (socketId) {
//               io.to(socketId).emit('new_notification_data', notification);
//             }
//           });
//           console.log(`Created and Pushed ${createdNotifications.length} chat notifications.`);
//         }
//       } catch (error) {
//         console.error('Error in sendMessage handler:', error);
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log(`Socket Disconnected: ${socket.user.name} (${socket.id})`);
//       userSocketMap.delete(socket.user._id.toString());
//     });
//   });

//   return { io, userSocketMap };
// };