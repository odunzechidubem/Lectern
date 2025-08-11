import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Set the JWT itself to expire in 15 minutes
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    // --- THIS IS THE CRITICAL COOKIE FIX FOR PRODUCTION ---
    // 'secure: true' tells the browser to only send the cookie over HTTPS.
    secure: process.env.NODE_ENV === 'production',
    // 'sameSite: "none"' is REQUIRED for cross-domain cookies when 'secure' is true.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    // --- THIS IS THE CHANGE ---
    // maxAge is in milliseconds. This sets the browser cookie to expire in 15 minutes.
    // 15 minutes * 60 seconds/minute * 1000 milliseconds/second
    maxAge: 15 * 60 * 1000,
  });
};

export default generateToken;
