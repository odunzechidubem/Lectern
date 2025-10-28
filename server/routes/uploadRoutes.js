import express from 'express';
const router = express.Router();
import { uploadFile } from '../controllers/uploadController.js'; // Removed generateUploadSignature
import { protect, isUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// This route remains for small, server-mediated uploads.
router.post('/', protect, isUser, upload.single('file'), uploadFile);

export default router;