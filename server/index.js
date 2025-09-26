// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import { createServer } from 'http';
// import { initSocketServer } from './socket.js';
// import connectDB from './config/db.js';
// import { notFound, errorHandler } from './middleware/authMiddleware.js';
// import userRoutes from './routes/userRoutes.js';
// import courseRoutes from './routes/courseRoutes.js';
// import uploadRoutes from './routes/uploadRoutes.js';
// import assignmentRoutes from './routes/assignmentRoutes.js';
// import submissionRoutes from './routes/submissionRoutes.js';
// import announcementRoutes from './routes/announcementRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import settingsRoutes from './routes/settingsRoutes.js';
// import footerLinkRoutes from './routes/footerLinkRoutes.js'; 
// import chatRoutes from './routes/chatRoutes.js';
// import articleRoutes from './routes/articleRoutes.js';

// dotenv.config();
// connectDB();
// const app = express();
// const httpServer = createServer(app);

// const { io, userSocketMap } = initSocketServer(httpServer);

// app.use((req, res, next) => {
//   req.io = io;
//   req.userSocketMap = userSocketMap;
//   next();
// });

// // --- THIS IS THE DEFINITIVE FIX ---
// const allowedOrigins = [
//   process.env.DEV_FRONTEND_URL, // e.g., http://localhost:5173
//   process.env.FRONTEND_URL,     // e.g., https://lecternn.netlify.app
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.get('/', (req, res) => res.send('API is running successfully...'));
// app.use('/api/users', userRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/submissions', submissionRoutes);
// app.use('/api/announcements', announcementRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/settings', settingsRoutes);
// app.use('/api/footer-links', footerLinkRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/articles', articleRoutes);

// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));



import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocketServer } from './socket.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/authMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import footerLinkRoutes from './routes/footerLinkRoutes.js'; 
import chatRoutes from './routes/chatRoutes.js';
import articleRoutes from './routes/articleRoutes.js';

dotenv.config();
connectDB();
const app = express();
const httpServer = createServer(app);

const { io, userSocketMap } = initSocketServer(httpServer);

app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

// --- FIXED CORS CONFIG ---
const allowedOrigins = [
  process.env.DEV_FRONTEND_URL, // e.g., http://localhost:5173
  process.env.FRONTEND_URL,     // e.g., https://lecternn.netlify.app
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like UC Browser or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.send('API is running successfully...'));
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/footer-links', footerLinkRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/articles', articleRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);