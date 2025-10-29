import express from 'express';
const router = express.Router();
import {
  registerUser, authUser, logoutUser, verifyEmail, getEnrolledCourses,
  getMySubmissions, forgotPassword, resetPassword, getUserProfile,
  updateUserProfile, changeUserPassword, deleteUserAccount,
  requestEmailChange, verifyEmailChange,
} from '../controllers/userController.js';
import { protect, student, isUser } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', authUser); 
router.post('/logout', logoutUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email-change/:token', verifyEmailChange);
router.route('/profile').get(protect, isUser, getUserProfile).put(protect, isUser, updateUserProfile).delete(protect, isUser, deleteUserAccount);
router.route('/profile/change-password').put(protect, isUser, changeUserPassword);
router.route('/profile/request-email-change').put(protect, isUser, requestEmailChange);
router.get('/enrolled-courses', protect, student, getEnrolledCourses);
router.get('/my-submissions', protect, student, getMySubmissions);

export default router;