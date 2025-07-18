import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private/Lecturer
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded.');
  }

  // --- THIS IS THE NEW, MORE EXPLICIT CONFIGURATION ---
  const options = {
    folder: 'lms_uploads',
    resource_type: 'auto', // Keep auto-detection for video vs. raw
    access_mode: 'public', // Force the asset to be public
    type: 'upload',        // Ensure it's a standard upload type
  };

  // Use a promise to handle the stream upload
  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options, // Pass the explicit options
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
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

export { uploadFile };