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

// --- THIS IS THE DEFINITIVE FIX ---
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
  // The origin is now explicitly set to the cleaned URL
  origin: frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl,
  credentials: true,
};
app.use(cors(corsOptions));
// --- END OF FIX ---

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
httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));