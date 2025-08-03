import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    
    // --- THIS IS THE DEFINITIVE FIX ---
    // In production, cookies must be secure and allow cross-site requests.
    // In development, they are not secure.
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'none', // Must be 'none' to allow cross-site cookies
    
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;