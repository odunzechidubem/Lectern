import express from 'express';
const router = express.Router();
import {
  createAssignment,
  submitAssignment,
} from '../controllers/assignmentController.js';
import { protect, lecturer, student } from '../middleware/authMiddleware.js';

// --- Lecturer Routes ---
// POST /api/assignments
router.post('/', protect, lecturer, createAssignment);

// --- Student Routes ---
// POST /api/assignments/:id/submit
router.post('/:id/submit', protect, student, submitAssignment);


export default router;