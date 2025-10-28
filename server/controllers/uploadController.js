// /server/controllers/uploadController.js (CANARY TEST VERSION)

import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

const uploadFile = asyncHandler(async (req, res) => {
  // This function is not being used, it's safe to ignore.
});

// --- THIS IS THE CANARY TEST FUNCTION ---
// It does not use Cloudinary. It only sends back a hardcoded message.
const generateUploadSignature = asyncHandler(async (req, res) => {
  console.log('--- [CANARY TEST] /api/upload/signature endpoint was hit! ---');
  console.log('--- If you see this log, the new code is running. ---');

  res.status(200).json({
    signature: 'hello-from-your-new-code',
    timestamp: '123456789',
  });
});

export { uploadFile, generateUploadSignature };