import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => { let token; if (req.cookies.jwt) { try { token = req.cookies.jwt; const decoded = jwt.verify(token, process.env.JWT_SECRET); req.user = await User.findById(decoded.userId).select('-password'); next(); } catch (error) { res.status(401); throw new Error('Not authorized, token failed'); } } else { res.status(401); throw new Error('Not authorized, no token'); } };
const lecturer = (req, res, next) => { if (req.user && req.user.role === 'lecturer') { next(); } else { res.status(403); throw new Error('Not authorized as a lecturer'); } };
const student = (req, res, next) => { if (req.user && req.user.role === 'student') { next(); } else { res.status(403); throw new Error('Not authorized as a student'); } };
const isUser = (req, res, next) => { if (req.user) { next(); } else { res.status(401); throw new Error('Not authorized, no user data'); } };

// --- NEW MIDDLEWARE ---
// Checks if the logged-in user is a superAdmin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superAdmin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an administrator');
  }
};

const notFound = (req, res, next) => { const error = new Error(`Not Found - ${req.originalUrl}`); res.status(404); next(error); };
const errorHandler = (err, req, res, next) => { let statusCode = res.statusCode === 200 ? 500 : res.statusCode; let message = err.message; if (err.name === 'CastError' && err.kind === 'ObjectId') { statusCode = 404; message = 'Resource not found'; } res.status(statusCode).json({ message: message, stack: process.env.NODE_ENV === 'production' ? null : err.stack, }); };

export { protect, lecturer, student, isUser, isAdmin, notFound, errorHandler };