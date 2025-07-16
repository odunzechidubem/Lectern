import express from 'express';
const router = express.Router();
import {
  createCourse,
  addLectureToCourse,
  getCourses,
  getCourseById,
  getMyCourses,
} from '../controllers/courseController.js';
import { protect, lecturer } from '../middleware/authMiddleware.js';

// --- POST Routes (Creating/Updating) ---
router.post('/', protect, lecturer, createCourse);
router.post('/:id/lectures', protect, lecturer, addLectureToCourse);

// --- GET Routes (Reading) ---
// Note the order: specific routes come before dynamic ones.

// Get all courses (Public)
router.get('/', getCourses);

// Get the logged-in lecturer's courses (Protected)
router.get('/mycourses', protect, lecturer, getMyCourses);

// Get a single course by ID (Public)
router.get('/:id', getCourseById);


export default router;