import express from 'express';
const router = express.Router();
import { uploadFile } from '../controllers/uploadController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Route for file uploads, accessible by any authenticated user
// POST /api/upload
router.post('/', protect, isUser, upload.single('file'), uploadFile);

export default router;