// import jwt from 'jsonwebtoken';

// const generateToken = (res, userId) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: '15m',
//   });

//   res.cookie('jwt', token, {
//     httpOnly: true,

//     secure: process.env.NODE_ENV === 'production' ? true : false, // boolean
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//     partitioned: true, // CHIPS support

//     maxAge: 15 * 60 * 1000, // 15 minutes
//   });
// };

// export default generateToken;




import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const cookieOptions = {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, 
    path: '/',               // ensure cookie is available site-wide
  };

  if (process.env.NODE_ENV === 'production') {
    // Production: secure, cross-site allowed, partitioned for Chrome CHIPS (optional)
    cookieOptions.secure = true;              // only send over HTTPS
    cookieOptions.sameSite = 'none';          // allow cross-site requests
    cookieOptions.partitioned = true;         // optional: CHIPS support (Chromium)
  } else {
    // Development: allow non-HTTPS localhost usage
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'lax';           // <-- explicitly set for dev
  }

  res.cookie('jwt', token, cookieOptions);
};

export default generateToken;