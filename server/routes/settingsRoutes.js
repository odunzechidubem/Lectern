import express from 'express';
const router = express.Router();
import { getSystemSettings, updateSystemSettings } from '../controllers/settingsController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Public GET route for anyone to fetch settings
router.route('/').get(getSystemSettings);

// Private PUT route for admins to update settings
router.route('/').put(protect, isAdmin, updateSystemSettings);

export default router;