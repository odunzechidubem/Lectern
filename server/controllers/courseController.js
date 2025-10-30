// /server/controllers/courseController.js

import asyncHandler from 'express-async-handler';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Assignment from '../models/assignmentModel.js';
import Notification from '../models/notificationModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc Add a lecture to a course
const addLectureToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, videoPublicId, notesUrl, notesPublicId } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Add the new lecture data to the array
  course.lectures.push({ title, videoUrl, videoPublicId, notesUrl, notesPublicId });

  // --- DEFINITIVE DEBUGGING BLOCK ---
  try {
    console.log('[BACKEND] Attempting to save new lecture to course...');
    await course.save();
    console.log('[BACKEND] Successfully saved lecture to database.');
  } catch (error) {
    console.error('--- [FATAL ERROR ON course.save()] ---');
    console.error('The final database save operation failed. This is the root cause.');
    console.error('Mongoose Error Details:', error); // This will print the exact validation error
    res.status(500);
    throw new Error('A database error occurred while saving the lecture.');
  }
  // --- END DEBUGGING BLOCK ---

  try {
    const message = `A new lecture "${title}" was added to the course "${course.title}".`;
    const link = `/course/${course._id}`;
    const notificationDocs = course.students.map(studentId => ({ user: studentId, message, link }));
    if (notificationDocs.length > 0) {
      const createdNotifications = await Notification.insertMany(notificationDocs);
      const { io, userSocketMap } = req;
      createdNotifications.forEach(notification => {
        const socketId = userSocketMap.get(notification.user.toString());
        if (socketId) { io.to(socketId).emit('new_notification_data', notification); }
      });
    }
  } catch (error) {
    console.error('Failed to create notifications for new lecture:', error);
  }

  res.status(201).json(course);
});


// --- ALL OTHER FUNCTIONS ARE UNCHANGED AND CORRECT ---

const getCourses = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword ? { title: { $regex: req.query.keyword, $options: 'i' } } : {};
  const courses = await Course.find({ ...keyword });
  const populatedCourses = await Promise.all(
    courses.map(async (course) => {
      const lecturer = await User.findById(course.lecturer).select('name email');
      const courseObject = course.toObject();
      courseObject.lecturer = lecturer;
      return courseObject;
    })
  );
  res.json(populatedCourses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    const [lecturer, students, assignments] = await Promise.all([
      User.findById(course.lecturer).select('name email'),
      User.find({ '_id': { $in: course.students } }).select('name email'),
      Assignment.find({ '_id': { $in: course.assignments } }),
    ]);
    const courseObject = course.toObject();
    courseObject.lecturer = lecturer;
    courseObject.students = students;
    courseObject.assignments = assignments;
    res.json(courseObject);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ lecturer: req.user._id });
  res.json(courses);
});

const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim() || !description || !description.trim()) {
    res.status(400);
    throw new Error('Title and description are required');
  }
  const course = new Course({ title, description, lecturer: req.user._id });
  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    course.title = title || course.title;
    course.description = description || course.description;
    await course.save();
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    const publicIdsToDelete = [];
    course.lectures.forEach(lecture => {
      if (lecture.videoPublicId) publicIdsToDelete.push({ id: lecture.videoPublicId, type: 'video' });
      if (lecture.notesPublicId) publicIdsToDelete.push({ id: lecture.notesPublicId, type: 'raw' });
    });
    const assignments = await Assignment.find({ '_id': { $in: course.assignments } });
    assignments.forEach(ass => {
        if (ass.instructionFilePublicId) {
            publicIdsToDelete.push({ id: ass.instructionFilePublicId, type: 'raw' });
        }
    });
    if (publicIdsToDelete.length > 0) {
      try {
        await Promise.all(publicIdsToDelete.map(asset => 
          cloudinary.uploader.destroy(asset.id, { resource_type: asset.type })
        ));
      } catch (err) {
        console.error("Error during bulk deletion of course assets:", err);
      }
    }
    await Assignment.deleteMany({ course: course._id });
    await course.deleteOne();
    res.json({ message: 'Course and associated assets deleted' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

const deleteLectureFromCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) {
      res.status(404);
      throw new Error('Lecture not found');
    }
    if (lecture.videoPublicId) {
      try { await cloudinary.uploader.destroy(lecture.videoPublicId, { resource_type: 'video' }); }
      catch (err) { console.error("Failed to delete lecture video:", err); }
    }
    if (lecture.notesPublicId) {
      try { await cloudinary.uploader.destroy(lecture.notesPublicId, { resource_type: 'raw' }); }
      catch (err) { console.error("Failed to delete lecture notes:", err); }
    }
    course.lectures.pull(req.params.lectureId);
    await course.save();
    res.json({ message: 'Lecture deleted' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.students.includes(req.user._id)) {
      res.status(400);
      throw new Error('Already enrolled');
    }
    course.students.push(req.user._id);
    await course.save();
    res.json({ message: 'Enrolled successfully' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

export {
  createCourse,
  addLectureToCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  enrollInCourse,
  deleteLectureFromCourse,
  deleteCourse,
};