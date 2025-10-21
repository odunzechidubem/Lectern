import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// This function for smaller uploads can remain as is.
const uploadFile = asyncHandler(async (req, res) => {
    // ... function content is unchanged ...
});

// --- THIS IS THE CORRECTED FUNCTION ---
const generateUploadSignature = asyncHandler(async (req, res) => {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);

    // --- THE FIX IS HERE: Parameters must be sorted alphabetically ---
    const params_to_sign = {
      folder: 'lms_uploads',
      timestamp: timestamp,
    };

    // Use the Cloudinary SDK to securely generate a signature.
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      process.env.CLOUDINARY_API_SECRET
    );
    
    // Add a log to confirm signature generation on the server
    console.log('[SUCCESS] Generated upload signature:', signature);

    res.status(200).json({
      signature: signature,
      timestamp: timestamp,
    });

  } catch (error) {
      // Add a log to see the specific error on the server if it fails
      console.error('[FAILURE] Failed to generate upload signature:', error);
      res.status(500);
      throw new Error(`Failed to generate upload signature: ${error.message}`);
  }
});


export { uploadFile, generateUploadSignature };