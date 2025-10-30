// /server/controllers/adminController.js

import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Settings from '../models/settingsModel.js';
import Course from '../models/courseModel.js';
import Article from '../models/articleModel.js'; // Import Article model
import cloudinary from '../config/cloudinary.js';   // Import Cloudinary SDK

const getAllUsers = asyncHandler(async (req, res) => {
  const role = req.query.role ? req.query.role.trim() : null;

  if (!role) {
    res.status(400);
    throw new Error('Role query parameter is required');
  }
  if (role !== 'student' && role !== 'lecturer') {
    res.status(400);
    throw new Error("Invalid role specified. Must be 'student' or 'lecturer'.");
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
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Administrators cannot change their own status.');
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

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'superAdmin') {
      res.status(400);
      throw new Error('Cannot delete a super administrator');
    }
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Administrators cannot delete their own account.');
    }

    // --- THIS IS THE FIX ---
    // If the user has a profile image with a public_id, delete it from Cloudinary first.
    if (user.profileImagePublicId) {
      try {
        console.log(`Deleting profile image from Cloudinary: ${user.profileImagePublicId}`);
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        console.error("Failed to delete user profile image from Cloudinary. Continuing with user deletion.", err);
        // We log the error but don't stop the process.
      }
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
  // Note: This function only deletes the course record.
  // A more advanced version would also delete associated lecture videos/notes from Cloudinary.
  // This requires storing public_ids for those assets as well.
  const course = await Course.findById(req.params.id);

  if (course) {
    await course.deleteOne();
    res.status(200).json({ message: 'Course deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// We are adding the logic to delete articles here since the Admin Dashboard handles it.
const deleteArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (article) {
    // --- THIS IS THE FIX ---
    // If the article has a file with a public_id, delete it from Cloudinary.
    if (article.filePublicId) {
      try {
        console.log(`Deleting article file from Cloudinary: ${article.filePublicId}`);
        await cloudinary.uploader.destroy(article.filePublicId, { resource_type: 'raw' }); // Use 'raw' for PDFs
      } catch (err) {
        console.error("Failed to delete article PDF from Cloudinary. Continuing with article deletion.", err);
      }
    }
    await article.deleteOne();
    res.status(200).json({ message: 'Article deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Article not found');
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
  deleteArticleById, // Ensure this is exported to be used in your routes
};