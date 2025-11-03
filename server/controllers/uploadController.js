import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// This function handles smaller, server-mediated uploads (profile pics, articles)
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded.');
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'lms_uploads', resource_type: 'auto' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // --- THIS IS THE FIX ---
    // Return both the secure_url and the public_id
    res.status(201).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id, // <-- ADDED THIS
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
});

// This function for generating signatures is unchanged.
const generateUploadSignature = asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params_to_sign = {
    folder: 'lms_uploads',
    timestamp: timestamp,
  };

  try {
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature: signature,
      timestamp: timestamp,
    });
  } catch (error) {
    console.error('Signature Generation Error:', error);
    res.status(500);
    throw new Error('Could not generate an upload signature.');
  }
});

export { uploadFile, generateUploadSignature };