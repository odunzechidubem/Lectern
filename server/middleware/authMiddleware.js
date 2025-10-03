import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import { USER_ROLES } from '../utils/constants.js';

// This is now wrapped in asyncHandler to handle potential errors gracefully
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database
      const userFromDb = await User.findById(decoded.userId).select('-password');
      console.log('--- [PROTECT MIDDLEWARE] ---');
      console.log('User fetched from DB:', userFromDb); // Log the user fetched from DB

      // Check if user exists
      if (userFromDb) {
        req.user = userFromDb;
        next();
      } else {
        res.status(401);
        throw new Error('Not authorized, token failed (user not found)');
      }
    } catch (error) {
      console.error('TOKEN VERIFICATION ERROR:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Checks if the logged-in user is a superAdmin
const isAdmin = (req, res, next) => {
  console.log('--- [IS_ADMIN MIDDLEWARE CHECK] ---');
  console.log('User Role found on request:', req.user?.role);
  console.log('Is role equal to "superAdmin"?', req.user?.role === USER_ROLES.SUPER_ADMIN);

  if (req.user && req.user.role === USER_ROLES.SUPER_ADMIN) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an administrator');
  }
};

const lecturer = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.LECTURER) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a lecturer');
  }
};

const student = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.STUDENT) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a student');
  }
};

const isUser = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized, no user data');
  }
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { protect, lecturer, student, isUser, isAdmin, notFound, errorHandler };