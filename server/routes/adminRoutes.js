import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  toggleUserStatus,
  deleteUserById,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

router.use(protect, isAdmin);
router.route('/users').get(getAllUsers);
router.route('/users/:id').delete(deleteUserById);
router.route('/users/:id/toggle-status').put(toggleUserStatus);

export default router;