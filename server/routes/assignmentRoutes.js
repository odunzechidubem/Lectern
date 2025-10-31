// /server/routes/assignmentRoutes.js

import express from 'express';
const router = express.Router();
import {
  createAssignment,
  deleteAssignment,
  getAssignmentById,
  submitAssignment,
  getSubmissionsForAssignment,
} from '../controllers/assignmentController.js';
import { protect, lecturer, student } from '../middleware/authMiddleware.js';

// Matches /api/assignments
router.route('/').post(protect, lecturer, createAssignment);

// Matches /api/assignments/:id
router.route('/:id')
  .get(protect, getAssignmentById);
  // Note: The simple delete route is removed in favor of the more specific one below.

// Matches /api/assignments/:id/submit
router.route('/:id/submit').post(protect, student, submitAssignment);

// Matches /api/assignments/:id/submissions
router.route('/:id/submissions').get(protect, lecturer, getSubmissionsForAssignment);

// --- THIS IS THE FIX ---
// This new route is more specific, providing both IDs needed for a safe deletion.
// DELETE /api/assignments/:courseId/:assignmentId
router.route('/:courseId/:assignmentId').delete(protect, lecturer, deleteAssignment);


export default router;