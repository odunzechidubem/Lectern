// /server/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Settings from '../models/settingsModel.js';
import Course from '../models/courseModel.js';
import Article from '../models/articleModel.js';
import Assignment from '../models/assignmentModel.js';
import cloudinary from '../config/cloudinary.js';

// This function is correct and remains unchanged.
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

// This function is correct and remains unchanged.
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

// This function is correct and remains unchanged.
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
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        console.error(
          'Failed to delete user profile image from Cloudinary. Continuing with user deletion.',
          err
        );
      }
    }
    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// This function is correct and remains unchanged.
const getSystemSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ singleton: 'system_settings' });
  if (!settings) {
    settings = await Settings.create({});
  }
  res.status(200).json(settings);
});

// --- THIS IS THE DEFINITIVE AND FINAL FIX ---
// The logic is now identical to the working profile photo update logic.
const updateSystemSettings = asyncHandler(async (req, res) => {
  // Step 1: FETCH the existing settings document first.
  let settings = await Settings.findOne({ singleton: 'system_settings' });
  if (!settings) {
    settings = new Settings(); // Create a new instance if one doesn't exist.
  }

  // Step 2: DELETE OLD ASSETS from Cloudinary if new ones are being uploaded.
  const { logoPublicId, faviconPublicId } = req.body;
  const deletionPromises = [];

  // Check for logo update
  if (logoPublicId && settings.logoPublicId) {
    console.log(`Queueing deletion for old logo: ${settings.logoPublicId}`);
    // CRITICAL: Pass the resource_type to the destroy method.
    deletionPromises.push(
      cloudinary.uploader.destroy(settings.logoPublicId, {
        resource_type: settings.logoResourceType || 'image', // Fallback to 'image'
      })
    );
  }

  // Check for favicon update
  if (faviconPublicId && settings.faviconPublicId) {
    console.log(`Queueing deletion for old favicon: ${settings.faviconPublicId}`);
    // CRITICAL: Pass the resource_type. Favicons might be 'raw' (like SVG).
    deletionPromises.push(
      cloudinary.uploader.destroy(settings.faviconPublicId, {
        resource_type: settings.faviconResourceType || 'image', // Fallback to 'image'
      })
    );
  }

  // Execute deletions concurrently
  if (deletionPromises.length > 0) {
    try {
      await Promise.all(deletionPromises);
      console.log('[SUCCESS] Cloudinary old asset deletion completed.');
    } catch (err) {
      console.error('[ERROR] Failed to delete one or more old assets from Cloudinary.', err);
      // We log the error but continue, as updating the DB link is more important.
    }
  }
  
  // Step 3: UPDATE the settings object in memory with all data from the request.
  Object.keys(req.body).forEach(key => {
    settings[key] = req.body[key];
  });

  // Step 4: SAVE the updated object to the database.
  const updatedSettings = await settings.save();

  res.status(200).json(updatedSettings);
});
// --- END OF FIX ---


// This function is correct and remains unchanged.
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).populate('lecturer', 'name email');
  res.status(200).json(courses);
});

// This function is correct and remains unchanged.
const deleteCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    const publicIdsToDelete = [];
    course.lectures.forEach((lecture) => {
      if (lecture.videoPublicId) {
        publicIdsToDelete.push({ id: lecture.videoPublicId, type: 'video' });
      }
      if (lecture.notesPublicId) {
        publicIdsToDelete.push({ id: lecture.notesPublicId, type: 'raw' });
      }
    });

    const assignments = await Assignment.find({ _id: { $in: course.assignments } });
    assignments.forEach((ass) => {
      if (ass.instructionFilePublicId) {
        publicIdsToDelete.push({ id: ass.instructionFilePublicId, type: 'raw' });
      }
    });

    if (publicIdsToDelete.length > 0) {
      try {
        await Promise.all(
          publicIdsToDelete.map((asset) =>
            cloudinary.uploader.destroy(asset.id, { resource_type: asset.type })
          )
        );
      } catch (err) {
        console.error(
          'Error during bulk deletion of course assets by admin. Continuing DB cleanup.',
          err
        );
      }
    }

    await Assignment.deleteMany({ course: course._id });
    await course.deleteOne();
    res.status(200).json({ message: 'Course and all associated assets have been deleted.' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// This function is correct and remains unchanged.
const deleteArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (article) {
    if (article.filePublicId) {
      try {
        await cloudinary.uploader.destroy(article.filePublicId, {
          resource_type: 'raw',
        });
      } catch (err) {
        console.error(
          'Failed to delete article PDF from Cloudinary. Continuing with article deletion.',
          err
        );
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
  deleteArticleById,
};