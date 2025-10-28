// /server/config/cloudinary.js (Final Version)

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables, but do not configure cloudinary here.
dotenv.config();

// Only export the un-configured cloudinary object.
export default cloudinary;