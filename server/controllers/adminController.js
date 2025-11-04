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

// --- THIS IS THE DEBUGGING VERSION ---
const updateSystemSettings = asyncHandler(async (req, res) => {
  console.log('\n--- [DEBUG] updateSystemSettings Initiated ---');
  console.log('[DEBUG] 1. Request Body Received:', JSON.stringify(req.body, null, 2));

  try {
    // Step 2: FETCH the current settings document from the database FIRST.
    let settings = await Settings.findOne({ singleton: 'system_settings' });
    if (!settings) {
      console.log('[DEBUG] 2a. No settings found, creating a new document.');
      settings = await Settings.create({});
    }
    console.log('[DEBUG] 2b. Fetched current settings from DB. Old logoPublicId:', settings.logoPublicId);
    console.log('[DEBUG] 2c. Fetched current settings from DB. Old faviconPublicId:', settings.faviconPublicId);

    const { logoPublicId: newLogoPublicId, faviconPublicId: newFaviconPublicId } = req.body;
    const deletionPromises = [];

    // Step 3: LOGIC FOR LOGO DELETION
    if (newLogoPublicId && settings.logoPublicId) {
      console.log(`[DEBUG] 3a. Condition MET for logo deletion. New ID: ${newLogoPublicId}, Old ID: ${settings.logoPublicId}`);
      deletionPromises.push(
        cloudinary.uploader.destroy(settings.logoPublicId)
          .then(result => console.log('[DEBUG] 3b. Cloudinary logo deletion API call result:', result))
          .catch(err => console.error('[DEBUG] 3c. Cloudinary logo deletion API call FAILED:', err))
      );
    } else {
      console.log('[DEBUG] 3a. Condition NOT MET for logo deletion.');
      if (!newLogoPublicId) console.log('[DEBUG]    Reason: No newLogoPublicId in request body.');
      if (!settings.logoPublicId) console.log('[DEBUG]    Reason: No old logoPublicId in database.');
    }

    // Step 4: LOGIC FOR FAVICON DELETION
    if (newFaviconPublicId && settings.faviconPublicId) {
      console.log(`[DEBUG] 4a. Condition MET for favicon deletion. New ID: ${newFaviconPublicId}, Old ID: ${settings.faviconPublicId}`);
      deletionPromises.push(
        cloudinary.uploader.destroy(settings.faviconPublicId)
          .then(result => console.log('[DEBUG] 4b. Cloudinary favicon deletion API call result:', result))
          .catch(err => console.error('[DEBUG] 4c. Cloudinary favicon deletion API call FAILED:', err))
      );
    } else {
      console.log('[DEBUG] 4a. Condition NOT MET for favicon deletion.');
      if (!newFaviconPublicId) console.log('[DEBUG]    Reason: No newFaviconPublicId in request body.');
      if (!settings.faviconPublicId) console.log('[DEBUG]    Reason: No old faviconPublicId in database.');
    }

    // Step 5: EXECUTE DELETIONS
    if (deletionPromises.length > 0) {
      console.log(`[DEBUG] 5a. Executing ${deletionPromises.length} deletion promise(s).`);
      await Promise.all(deletionPromises);
      console.log('[DEBUG] 5b. Finished awaiting deletion promises.');
    } else {
      console.log('[DEBUG] 5a. No deletions to execute.');
    }

    // Step 6: UPDATE DATABASE
    console.log('[DEBUG] 6a. Updating database with the new data...');
    const updatedSettings = await Settings.findByIdAndUpdate(
      settings._id,
      { $set: req.body },
      { new: true }
    );
    console.log('[DEBUG] 6b. Database update complete. New logoPublicId is now:', updatedSettings.logoPublicId);
    console.log('[DEBUG] 6c. Database update complete. New faviconPublicId is now:', updatedSettings.faviconPublicId);

    console.log('--- [DEBUG] updateSystemSettings Finished Successfully ---\n');
    res.status(200).json(updatedSettings);

  } catch (error) {
    console.error('[FATAL DEBUG ERROR] An error occurred in updateSystemSettings:', error);
    res.status(500).json({ message: 'An internal server error occurred during settings update.' });
  }
});
// --- END OF DEBUGGING VERSION ---

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