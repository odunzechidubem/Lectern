// server/controllers/uploadController.js
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

  // Use a promise to handle the stream upload
  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Automatically detect video or raw for PDF
        folder: 'lms_uploads', // Optional: store in a specific folder in Cloudinary
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    // Pipe the file buffer from multer into the upload stream
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