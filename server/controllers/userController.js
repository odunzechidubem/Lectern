// /server/controllers/userController.js

import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Submission from '../models/submissionModel.js';
import Assignment from '../models/assignmentModel.js';
import Settings from '../models/settingsModel.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// ================== REGISTER ==================
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !name.trim() || !email || !password || !role) {
    res.status(400);
    throw new Error('Please fill out all required fields.');
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long.');
  }

  const settings = await Settings.findOne({ singleton: 'system_settings' });
  if (settings) {
    if (role === 'student' && !settings.isStudentRegistrationEnabled) {
      res.status(403);
      throw new Error('New student registration is currently disabled.');
    }
    if (role === 'lecturer' && !settings.isLecturerRegistrationEnabled) {
      res.status(403);
      throw new Error('New lecturer registration is currently disabled.');
    }
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, role });

  if (user) {
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    // --- THE FIX: Create a link that points to your frontend route ---
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    const message = `<p>Please verify your email by clicking on the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`;

    try {
      const settings = await Settings.findOne({ singleton: 'system_settings' });
      await sendEmail({
        email: user.email,
        subject: 'LMS Email Verification',
        html: message,
        siteName: settings?.siteName,
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
      });
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

// ================== VERIFY EMAIL ==================
const verifyEmail = asyncHandler(async (req, res) => {
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  // --- THE FIX: Send a JSON success response, DO NOT REDIRECT ---
  res.status(200).json({ message: 'Email verified successfully.' });
});

// ================== LOGIN ==================
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in.');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been disabled. Please contact an administrator.');
  }

  let hasEnrolledCourses = false;
  if (user.role === 'student') {
    const enrollmentCount = await Course.countDocuments({ students: user._id });
    hasEnrolledCourses = enrollmentCount > 0;
  }

  generateToken(res, user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    hasEnrolledCourses,
  });
});

// ================== LOGOUT ==================
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// ================== COURSES ==================
const getEnrolledCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ students: req.user._id });
  const populatedCourses = await Promise.all(
    courses.map(async (course) => {
      const lecturer = await User.findById(course.lecturer).select('name');
      const courseObject = course.toObject();
      courseObject.lecturer = lecturer;
      return courseObject;
    })
  );
  res.status(200).json(populatedCourses);
});

// ================== SUBMISSIONS ==================
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ student: req.user._id }).sort({ createdAt: -1 });
  const populatedSubmissions = await Promise.all(
    submissions.map(async (submission) => {
      const [course, assignment] = await Promise.all([
        Course.findById(submission.course).select('title'),
        Assignment.findById(submission.assignment).select('title'),
      ]);
      const submissionObject = submission.toObject();
      submissionObject.course = course;
      submissionObject.assignment = assignment;
      return submissionObject;
    })
  );
  res.status(200).json(populatedSubmissions);
});

// ================== PASSWORD RESET ==================
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // This link must point to the frontend
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `<p>You requested a password reset. Please click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in 10 minutes.</p>`;

  try {
    const settings = await Settings.findOne({ singleton: 'system_settings' });
    await sendEmail({
      email: user.email,
      subject: 'LMS Password Reset Request',
      html: message,
      siteName: settings?.siteName,
    });
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Token is invalid or has expired.');
  }

  try {
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500);
    throw new Error('Something went wrong while resetting the password.');
  }
});

// ================== PROFILE ==================
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.profileImage = req.body.profileImage || user.profileImage;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
      res.status(400);
      throw new Error('New password must be at least 8 characters long.');
  }
  const user = await User.findById(req.user._id);
  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    await user.deleteOne();
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Account deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// ================== EMAIL CHANGE ==================
const requestEmailChange = asyncHandler(async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) {
    res.status(400);
    throw new Error('New email is required');
  }
  const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
  if (emailExists) {
    return res.status(200).json({
      message: 'If the email is available, you will receive a verification link.',
    });
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const changeToken = user.createEmailChangeToken();
  user.newEmail = newEmail.toLowerCase();
  await user.save({ validateBeforeSave: false });

  // This link must also point to the frontend
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email-change/${changeToken}`;
  const message = `<p>You requested to change your account's email address. Please confirm by clicking below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`;

  try {
    const settings = await Settings.findOne({ singleton: 'system_settings' });
    await sendEmail({
      email: newEmail,
      subject: 'Confirm Your New Email Address',
      html: message,
      siteName: settings?.siteName,
    });
    res.status(200).json({
      message: 'If the email is available, you will receive a verification link.',
    });
  } catch (err) {
    user.newEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

const verifyEmailChange = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailChangeToken: hashedToken,
    emailChangeTokenExpires: { $gt: Date.now() },
  });

  if (!user || !user.newEmail) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=failed`);
  }

  const emailAlreadyExists = await User.findOne({ email: user.newEmail });
  if (emailAlreadyExists) {
    user.newEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=failed`);
  }

  try {
    user.email = user.newEmail;
    user.isVerified = true;
    user.newEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeTokenExpires = undefined;

    const updatedUser = await user.save();

    if (req.io && req.userSocketMap) {
      const userSocketId = req.userSocketMap.get(updatedUser._id.toString());
      if (userSocketId) {
        req.io.to(userSocketId).emit('force-logout', {
          message: 'Your email has been changed. Please log in with your new email address.',
        });
      }
    }
    res.redirect(`${process.env.FRONTEND_URL}/login?emailChanged=true`);
  } catch (error) {
    console.error('Error finalizing email change:', error);
    res.status(500);
    throw new Error('An error occurred while updating your email. Please try again.');
  }
});

// ================== EXPORTS ==================
export {
  registerUser,
  authUser,
  logoutUser,
  verifyEmail,
  getEnrolledCourses,
  getMySubmissions,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  requestEmailChange,
  verifyEmailChange,
};