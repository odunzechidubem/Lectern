// /server/controllers/uploadController.js (Definitive Final Version)

import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// This function is for small uploads and is not part of the problem, but is included for completeness.
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded.');
  }
  const options = {
    folder: 'lms_uploads',
    resource_type: 'auto',
  };
  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) { return reject(error); }
      resolve(result);
    });
    uploadStream.end(req.file.buffer);
  });
  try {
    const result = await uploadPromise;
    res.status(201).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
});

// --- THIS IS THE DEFINITIVE FIX ---
// This function now handles configuration and validation internally.
const generateUploadSignature = asyncHandler(async (req, res) => {
  // 1. Explicitly load all required credentials from process.env at runtime.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // 2. Loudly fail if any credential is missing. This will send a 500 error to the client.
  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[FATAL] Cloudinary environment variables are missing on the Render server!");
    res.status(500);
    throw new Error("Server is not configured for uploads. Please contact support.");
  }

  // 3. Configure the cloudinary object on-the-fly for this specific request.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const timestamp = Math.round((new Date).getTime() / 1000);
  
  // 4. Create the signature with alphabetized parameters.
  const params_to_sign = {
    folder: 'lms_uploads',
    timestamp: timestamp,
  };

  try {
    const signature = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);
    
    // 5. Respond with the valid signature and timestamp.
    res.status(200).json({
      signature: signature,
      timestamp: timestamp,
    });

  } catch (error) {
    console.error("[CRITICAL] Cloudinary SDK failed to generate a signature:", error);
    res.status(500);
    throw new Error("Could not generate an upload signature.");
  }
});

export { uploadFile, generateUploadSignature };