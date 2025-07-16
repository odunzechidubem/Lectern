// server/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import { registerUser, authUser, logoutUser } from '../controllers/userController.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser); // <-- ADD THIS

export default router;