import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  toggleUserStatus,
  deleteUserById,
  getSystemSettings,
  updateSystemSettings,
  getAllCourses,
  deleteCourseById,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Apply admin protection to all routes in this file
router.use(protect, isAdmin);

// User management routes
router.route('/users').get(getAllUsers);
router.route('/users/:id/toggle-status').put(toggleUserStatus);
router.route('/users/:id').delete(deleteUserById);

// Settings routes
router.route('/settings').get(getSystemSettings).put(updateSystemSettings);

// --- NEW COURSE MANAGEMENT ROUTES ---
router.route('/courses').get(getAllCourses);
router.route('/courses/:id').delete(deleteCourseById);

export default router;