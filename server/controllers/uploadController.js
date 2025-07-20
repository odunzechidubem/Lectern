import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded.');
  }

  const options = {
    folder: 'lms_uploads',
    resource_type: 'auto',
    access_mode: 'public',
    type: 'upload',
  };

  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
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