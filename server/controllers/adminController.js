import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Settings from '../models/settingsModel.js';
import Course from '../models/courseModel.js';

const getAllUsers = asyncHandler(async (req, res) => {
  const role = req.query.role;
  if (!role) {
    res.status(400);
    throw new Error('Role query parameter is required');
  }
  const users = await User.find({ role, _id: { $ne: req.user._id } }).select('-password');
  res.status(200).json(users);
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'superAdmin') {
      res.status(400);
      throw new Error('Cannot disable a super administrator');
    }
    user.isActive = !user.isActive;
    const updatedUser = await user.save();

    if (!user.isActive) {
      const { userSocketMap, io } = req;
      const userSocketId = userSocketMap.get(user._id.toString());
      if (userSocketId) {
        io.to(userSocketId).emit('force-logout', {
          message: 'Your account has been disabled by an administrator.',
        });
        console.log(`Sent force-logout event to user: ${user.name}`);
      }
    }

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

const updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { singleton: 'system_settings' },
    { $set: req.body },
    { new: true, upsert: true }
  );
  res.status(200).json(settings);
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).populate('lecturer', 'name email');
  res.status(200).json(courses);
});

const deleteCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    await course.deleteOne();
    res.status(200).json({ message: 'Course deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

export {
  getAllUsers,
  toggleUserStatus,
  deleteUserById,
  getSystemSettings,
  updateSystemSettings,
  getAllCourses,
  deleteCourseById,
}; 