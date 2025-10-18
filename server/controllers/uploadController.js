import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// This function handles smaller files by streaming them through your server.
// It's still useful for things like profile images or small PDF notes.
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


// --- THIS IS THE NEW FUNCTION FOR DIRECT UPLOADS ---
// It does NOT handle a file. It only creates a secure signature.
const generateUploadSignature = asyncHandler(async (req, res) => {
  // Get the current timestamp in seconds.
  const timestamp = Math.round((new Date).getTime() / 1000);

  // Define parameters for the signature. You can add more here if needed.
  const params_to_sign = {
    timestamp: timestamp,
    folder: 'lms_uploads',
  };

  try {
    // Use the Cloudinary SDK to securely generate a signature using your API Secret.
    // The secret is never exposed to the client.
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      process.env.CLOUDINARY_API_SECRET
    );

    // Send the public API key, signature, and timestamp back to the client.
    res.status(200).json({
      signature: signature,
      timestamp: timestamp,
      cloudname: process.env.CLOUDINARY_CLOUD_NAME,
      apikey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
      res.status(500);
      throw new Error(`Failed to generate upload signature: ${error.message}`);
  }
});


export { uploadFile, generateUploadSignature };