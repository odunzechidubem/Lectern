import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // <-- Now includes cookie-parser

// --- Local Imports ---
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/authMiddleware.js';

// --- Route Imports ---
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// --- Initial Server Setup ---
// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectDB();

// Initialize the Express application
const app = express();

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Enable the express app to parse JSON formatted request bodies
app.use(express.json());

// Enable the express app to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// --- NEW: Parse cookies from incoming requests ---
app.use(cookieParser());


// --- API Routes ---
// A simple test route to check if the API is running
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Use the imported routers for specific API endpoints
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);


// --- Error Handling Middleware ---
// These must be the last items in the middleware chain.
// 1. Handle 404 Not Found errors for any route not defined above.
app.use(notFound);
// 2. Handle all other errors (e.g., from controllers, middleware).
app.use(errorHandler);


// --- Start the Server ---
// Get the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start listening for connections on the specified port
app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);