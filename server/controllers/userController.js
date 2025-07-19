import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Submission from '../models/submissionModel.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ name, email, password, role });
  if (user) {
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
    const message = `<p>Please verify your email by clicking on the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    try {
      await sendEmail({ email: user.email, subject: 'LMS Email Verification', html: message });
      res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (err) {
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw new Error('Email could not be sent. Please try again.');
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user (Login)
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in.');
  }
  generateToken(res, user._id);
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

// @desc    Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
  const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ verificationToken, verificationTokenExpires: { $gt: Date.now() } });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token.');
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();
  res.status(200).send('<h1>Email Verified</h1><p>Your email has been successfully verified. You can now close this tab and log in.</p>');
});

// @desc    Logout user / clear cookie
const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get courses a student is enrolled in
const getEnrolledCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ students: req.user._id })
    .populate('lecturer', 'name');
  res.status(200).json(courses);
});

// @desc    Get all submissions for the logged-in student
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ student: req.user._id })
    .populate({
      path: 'course',
      select: 'title',
    })
    .populate({
      path: 'assignment',
      select: 'title',
    })
    .sort({ createdAt: -1 });

  res.status(200).json(submissions);
});

export { registerUser, authUser, logoutUser, verifyEmail, getEnrolledCourses, getMySubmissions };