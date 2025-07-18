// server/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import { registerUser, authUser, logoutUser, verifyEmail } from '../controllers/userController.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/verify/:token', verifyEmail); // <-- ADD THIS

export default router;