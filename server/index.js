import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocketServer } from './socket.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/authMiddleware.js';

// --- ROUTE IMPORTS (ALL 11) ---
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


// --- INITIAL SETUP ---
dotenv.config();
connectDB();
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO and get the io instance and user map
const { io, userSocketMap } = initSocketServer(httpServer);

// --- CORE MIDDLEWARE (CORRECT ORDER) ---
// 1. Make socket instance available on all requests
app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

// 2. CORS for handling cross-origin requests
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  })
);

// 3. Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API ROUTES ---
// Test route
app.get('/', (req, res) => res.send('API is running successfully...'));

// Application routes
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

// --- ERROR HANDLING MIDDLEWARE (MUST BE LAST) ---
app.use(notFound);
app.use(errorHandler);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));