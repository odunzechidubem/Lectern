import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  res.cookie('jwt', token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production' ? true : false, // boolean
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    partitioned: true, // CHIPS support

    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

export default generateToken;
