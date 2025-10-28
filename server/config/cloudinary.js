// /server/config/cloudinary.js (Definitive Final Version)

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables from your .env file
dotenv.config();

// --- SERVER STARTUP CONFIGURATION ---
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Log to the server console on startup to confirm variables are loaded
console.log("--- [Cloudinary Config] Initializing... ---");
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log(`[SUCCESS] Cloudinary configured for cloud: ${cloudName}`);
} else {
  console.error("[FATAL] Cloudinary configuration failed. One or more environment variables (CLOUD_NAME, API_KEY, API_SECRET) are missing.");
}
// --- END CONFIGURATION ---

export default cloudinary;