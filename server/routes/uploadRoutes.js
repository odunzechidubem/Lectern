// server/routes/uploadRoutes.js
import express from 'express';
const router = express.Router();
import { uploadFile } from '../controllers/uploadController.js';
import { protect, lecturer } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// This route first protects against non-logged-in users,
// then against non-lecturers, then uses multer to handle a single file upload
// with the field name 'file', and finally runs the uploadFile controller.
router.post('/', protect, lecturer, upload.single('file'), uploadFile);

export default router;