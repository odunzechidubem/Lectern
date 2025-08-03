import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    // When NODE_ENV is 'production' (on Render), this will be true.
    secure: process.env.NODE_ENV === 'production',
    // When NODE_ENV is 'production', this will be 'None', allowing cross-site cookies.
    // In local dev, it will be 'strict'.
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;