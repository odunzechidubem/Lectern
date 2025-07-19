import express from 'express';
const router = express.Router();
import {
  registerUser,
  authUser,
  logoutUser,
  verifyEmail,
  getEnrolledCourses,
  getMySubmissions,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';
import { protect, student } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Student-specific routes
router.get('/enrolled-courses', protect, student, getEnrolledCourses);
router.get('/my-submissions', protect, student, getMySubmissions);

export default router;