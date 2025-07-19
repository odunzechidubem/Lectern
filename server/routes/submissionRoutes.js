import express from 'express';
const router = express.Router();
import { gradeSubmission } from '../controllers/submissionController.js';
import { protect, lecturer } from '../middleware/authMiddleware.js';

// PUT /api/submissions/:id/grade
router.route('/:id/grade').put(protect, lecturer, gradeSubmission);

export default router;