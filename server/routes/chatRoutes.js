import express from 'express';
const router = express.Router();
import { getCourseMessages } from '../controllers/chatController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';

router.route('/:courseId/messages').get(protect, isUser, getCourseMessages);

export default router;