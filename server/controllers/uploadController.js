// /server/controllers/uploadController.js (Final Debugging Version 2)

import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

const uploadFile = asyncHandler(async (req, res) => {
  // This function is not being used for large uploads, it can be ignored.
});

const generateUploadSignature = asyncHandler(async (req, res) => {
  // --- SERVER-SIDE LOGGING ---
  console.log("--- [BACKEND] /api/upload/signature endpoint has been hit. ---");

  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    console.error("[FATAL] CLOUDINARY_API_SECRET is NOT DEFINED on the server. Check Render environment variables.");
    res.status(500);
    throw new Error('Server configuration error: Cloudinary secret is missing.');
  } else {
    console.log("[SUCCESS] Server has loaded CLOUDINARY_API_SECRET.");
  }

  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    console.log(`[BACKEND] Timestamp generated: ${timestamp}`);

    const params_to_sign = {
      folder: 'lms_uploads',
      timestamp: timestamp,
    };
    
    console.log("[BACKEND] Parameters to sign:", params_to_sign);

    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      apiSecret
    );
    
    if(!signature) {
        console.error("[FATAL] cloudinary.utils.api_sign_request returned UNDEFINED. Check parameters and secret.");
        throw new Error('Failed to generate a valid signature from Cloudinary SDK.');
    }

    console.log(`[BACKEND] Signature generated successfully: ${signature.substring(0, 10)}...`);

    res.status(200).json({
      signature: signature,
      timestamp: timestamp,
    });

  } catch (error) {
    console.error('[CRITICAL] An error was caught inside the generateUploadSignature function:', error);
    res.status(500);
    throw new Error(`Failed to generate upload signature: ${error.message}`);
  }
});

export { uploadFile, generateUploadSignature };