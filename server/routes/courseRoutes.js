import express from 'express';
const router = express.Router();
import {
  createCourse, addLectureToCourse, getCourses, getCourseById, getMyCourses,
  updateCourse, enrollInCourse, deleteLectureFromCourse, deleteCourse,
  getCourseUsers
} from '../controllers/courseController.js';
import { protect, lecturer, student } from '../middleware/authMiddleware.js';

// Course routes
router.route('/')
  .get(getCourses)
  .post(protect, lecturer, createCourse);

router.route('/mycourses').get(protect, lecturer, getMyCourses);

router.route('/:id')
  .get(getCourseById)
  .put(protect, lecturer, updateCourse)
  .delete(protect, lecturer, deleteCourse);

// Lecture routes
router.route('/:id/lectures').post(protect, lecturer, addLectureToCourse);
router.route('/:courseId/lectures/:lectureId').delete(protect, lecturer, deleteLectureFromCourse);

// Student enrollment route
router.route('/:id/enroll').post(protect, student, enrollInCourse);

// New route: Get all course users for tagging
router.get('/:courseId/users', protect, getCourseUsers);

export default router;
