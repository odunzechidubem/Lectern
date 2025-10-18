// /server/routes/uploadRoutes.js

import express from 'express';
const router = express.Router();
import { uploadFile, generateUploadSignature } from '../controllers/uploadController.js';
import { protect, isUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// This is the original route for smaller, server-mediated uploads (e.g., profile pictures).
// It's good to keep it for those use cases.
router.post('/', protect, isUser, upload.single('file'), uploadFile);

// --- THIS IS THE NEW ROUTE FOR SIGNED UPLOADS ---
// It allows an authenticated user to get a secure, temporary signature
// to upload a file directly to Cloudinary.
// GET /api/upload/signature
router.get('/signature', protect, isUser, generateUploadSignature);

export default router;