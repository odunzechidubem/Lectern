import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    // --- THIS IS THE CRITICAL FIX ---
    // In production, the cookie must be secure and allow cross-site requests.
    secure: process.env.NODE_ENV === 'production',
    // 'None' is required for cross-domain cookies. The 'secure' attribute must be true.
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
    // You can optionally set the domain here, but it's often not needed if sameSite is 'None'
    // domain: process.env.NODE_ENV === 'production' ? '.your-frontend-domain.com' : undefined,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;