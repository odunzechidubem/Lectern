// /server/index.js
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

// --- DEFINITIVE FIX: Import node-cron and the User model ---
import cron from 'node-cron';
import User from './models/userModel.js';
// ---------------------------------------------------------

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

const allowedOrigins = [
  process.env.DEV_FRONTEND_URL, // e.g., http://localhost:5173
  process.env.FRONTEND_URL, // e.g., https://lectern.site
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.send('API is running successfully...'));
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

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

// --- DEFINITIVE FIX: SCHEDULED DELETION OF UNVERIFIED USERS ---
// This cron job runs at midnight every day ('0 0 * * *').
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON JOB] Running daily check for unverified users...');
  try {
    const expirationDate = new Date();
    // Go back in time by the token validity period to find expired tokens
    // The token expiry is 10 minutes, so we look for users older than that.
    // A wider window (e.g., 1 hour) is safe.
    expirationDate.setHours(expirationDate.getHours() - 1);

    // Find users who are not verified AND whose expiration date is in the past.
    const query = {
      isVerified: false,
      verificationTokenExpires: { $lt: new Date() },
    };

    const usersToDelete = await User.find(query);

    if (usersToDelete.length > 0) {
      console.log(`[CRON JOB] Found ${usersToDelete.length} unverified, expired user(s) to delete.`);
      const result = await User.deleteMany(query);
      console.log(`[CRON JOB] Successfully deleted ${result.deletedCount} user(s).`);
    } else {
      console.log('[CRON JOB] No expired unverified users found.');
    }
  } catch (error) {
    console.error('[CRON JOB] Error deleting unverified users:', error);
  }
});
// ---------------------------------------------------

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);