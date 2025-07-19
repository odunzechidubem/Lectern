import express from 'express';
const router = express.Router();
import {
  createAssignment,
  deleteAssignment,
  getAssignmentById,
  submitAssignment,
  getSubmissionsForAssignment, // <-- IMPORT
} from '../controllers/assignmentController.js';
import { protect, lecturer, student } from '../middleware/authMiddleware.js';

// Matches /api/assignments
router.route('/').post(protect, lecturer, createAssignment);

// Matches /api/assignments/:id
router.route('/:id')
  .get(protect, getAssignmentById)
  .delete(protect, lecturer, deleteAssignment);

// Matches /api/assignments/:id/submit
router.route('/:id/submit').post(protect, student, submitAssignment);

// Matches /api/assignments/:id/submissions
router.route('/:id/submissions').get(protect, lecturer, getSubmissionsForAssignment);

export default router;