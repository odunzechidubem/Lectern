import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    // --- THIS IS THE CHANGE ---
    expiresIn: '3m', // Set the JWT itself to expire in 3 minutes
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // --- THIS IS THE CHANGE ---
    // maxAge is in milliseconds. This sets the browser cookie to expire in 3 minutes.
    // 3 minutes * 60 seconds/minute * 1000 milliseconds/second
    maxAge: 3 * 60 * 1000,
  });
};

export default generateToken;