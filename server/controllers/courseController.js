// /server/controllers/courseController.js

import asyncHandler from 'express-async-handler';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Assignment from '../models/assignmentModel.js';
import Notification from '../models/notificationModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc Get all courses (with search functionality restored)
const getCourses = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? { title: { $regex: req.query.keyword, $options: 'i' } }
    : {};

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

// @desc Get a single course by ID
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

// @desc Get a lecturer's own courses
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ lecturer: req.user._id });
  res.json(courses);
});

// @desc Create a new course
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

// @desc Update a course
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

// @desc Delete a course
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    // --- THIS IS THE FIX ---
    // Gather all public_ids from lectures within the course
    const publicIdsToDelete = [];
    course.lectures.forEach(lecture => {
      if (lecture.videoPublicId) publicIdsToDelete.push({ id: lecture.videoPublicId, type: 'video' });
      if (lecture.notesPublicId) publicIdsToDelete.push({ id: lecture.notesPublicId, type: 'raw' });
    });
    
    // You would add similar logic for assignment instruction files if needed
    const assignments = await Assignment.find({ '_id': { $in: course.assignments } });
    assignments.forEach(ass => {
        if (ass.instructionFilePublicId) {
            publicIdsToDelete.push({ id: ass.instructionFilePublicId, type: 'raw' });
        }
    });

    if (publicIdsToDelete.length > 0) {
      console.log(`Deleting ${publicIdsToDelete.length} assets from Cloudinary for course ${course.title}.`);
      try {
        await Promise.all(publicIdsToDelete.map(asset => 
          cloudinary.uploader.destroy(asset.id, { resource_type: asset.type })
        ));
      } catch (err) {
        console.error("Error during bulk deletion of course assets. Continuing with DB deletion.", err);
      }
    }

    // Delete the course and its associated assignments from the database
    await Assignment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ message: 'Course and associated assets deleted' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc Add a lecture to a course
const addLectureToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, videoPublicId, notesUrl, notesPublicId } = req.body;
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    course.lectures.push({ title, videoUrl, videoPublicId, notesUrl, notesPublicId });
    await course.save();
    
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
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc Delete a lecture from a course
const deleteLectureFromCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const lecture = course.lectures.find(lec => lec._id.toString() === req.params.lectureId);
    if (!lecture) {
      res.status(404);
      throw new Error('Lecture not found');
    }

    // --- THIS IS THE FIX ---
    if (lecture.videoPublicId) {
      try { await cloudinary.uploader.destroy(lecture.videoPublicId, { resource_type: 'video' }); }
      catch (err) { console.error("Failed to delete lecture video:", err); }
    }
    if (lecture.notesPublicId) {
      try { await cloudinary.uploader.destroy(lecture.notesPublicId, { resource_type: 'raw' }); }
      catch (err) { console.error("Failed to delete lecture notes:", err); }
    }
    
    course.lectures.pull({ _id: req.params.lectureId });
    await course.save();
    res.json({ message: 'Lecture deleted' });
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc Enroll a student in a course
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