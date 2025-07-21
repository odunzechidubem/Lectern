import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Settings from '../models/settingsModel.js';

// @desc    Get all users by role
const getAllUsers = asyncHandler(async (req, res) => {
  const role = req.query.role;
  if (!role) {
    res.status(400);
    throw new Error('Role query parameter is required');
  }
  const users = await User.find({ role, _id: { $ne: req.user._id } }).select('-password');
  res.status(200).json(users);
});

// @desc    Toggle a user's active status
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'superAdmin') {
      res.status(400);
      throw new Error('Cannot disable a super administrator');
    }
    user.isActive = !user.isActive;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete a user by ID - THIS FUNCTION IS NOW FIXED
const deleteUserById = asyncHandler(async (req, res) => {
  // The extra period after 'params' has been removed.
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'superAdmin') {
      res.status(400);
      throw new Error('Cannot delete a super administrator');
    }
    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get system settings
const getSystemSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ singleton: 'system_settings' });
  if (!settings) {
    settings = await Settings.create({
      isStudentRegistrationEnabled: true,
      isLecturerRegistrationEnabled: true,
    });
  }
  res.status(200).json(settings);
});

// @desc    Update system settings
const updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { singleton: 'system_settings' },
    { $set: req.body },
    { new: true, upsert: true }
  );
  res.status(200).json(settings);
});

export { getAllUsers, toggleUserStatus, deleteUserById, getSystemSettings, updateSystemSettings };