// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to protect routes by checking for a valid token
const protect = async (req, res, next) => {
  let token;

  // The token is sent in the headers like this: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (split by space and get the second part)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID that was stored in the token
      // Attach the user object to the request, but exclude the password
      req.user = await User.findById(decoded.userId).select('-password');

      // Move on to the next function (the actual route controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// Middleware to check if the user is a lecturer
const lecturer = (req, res, next) => {
  if (req.user && req.user.role === 'lecturer') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a lecturer');
  }
};

// Middleware for handling "Not Found" errors (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware for handling all other errors
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come in with a 200 status code, so we fix it
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose-specific error handling for bad ObjectIds
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  res.status(statusCode).json({
    message: message,
    // In development mode, also send the stack trace for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { protect, lecturer, notFound, errorHandler };