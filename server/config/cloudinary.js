// // server/config/cloudinary.js
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export default cloudinary;




// /server/config/cloudinary.js (Final Debugging Version)

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// --- SERVER-SIDE LOGGING ---
console.log("--- [CONFIG] Initializing Cloudinary Configuration ---");
console.log(`[CONFIG] CLOUDINARY_CLOUD_NAME from env: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'MISSING'}`);
console.log(`[CONFIG] CLOUDINARY_API_KEY from env: ${process.env.CLOUDINARY_API_KEY ? 'Loaded' : 'MISSING'}`);
console.log(`[CONFIG] CLOUDINARY_API_SECRET from env: ${process.env.CLOUDINARY_API_SECRET ? 'Loaded' : 'MISSING'}`);
// --- END LOGGING ---

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;