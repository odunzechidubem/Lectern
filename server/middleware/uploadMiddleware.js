// server/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';

// Set up storage engine for multer. We'll use memory storage.
const storage = multer.memoryStorage();

// Middleware to check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /mp4|mov|avi|pdf/;
  // Check the extension name
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only video files (mp4, mov, avi) and PDF files are allowed!'));
  }
}

// Initialize multer upload middleware
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;