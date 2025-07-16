import asyncHandler from 'express-async-handler';
import Course from '../models/courseModel.js';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Lecturer
const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Please provide a title and description');
  }

  const courseExists = await Course.findOne({ title, lecturer: req.user._id });

  if (courseExists) {
    res.status(400);
    throw new Error('You have already created a course with this title');
  }

  const course = new Course({
    title,
    description,
    lecturer: req.user._id,
  });

  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

// @desc    Add a lecture to a course
// @route   POST /api/courses/:id/lectures
// @access  Private/Lecturer
const addLectureToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, notesUrl } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to add lectures to this course');
  }

  const newLecture = { title, videoUrl, notesUrl };
  course.lectures.push(newLecture);
  const updatedCourse = await course.save();
  res.status(201).json(updatedCourse.lectures[updatedCourse.lectures.length - 1]);
});

// --- NEW ---
// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  // We use .populate() to replace the lecturer's ObjectId with their name and email
  const courses = await Course.find({}).populate('lecturer', 'name email');
  res.json(courses);
});

// --- NEW ---
// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('lecturer', 'name email');

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// --- NEW ---
// @desc    Get courses created by a lecturer
// @route   GET /api/courses/mycourses
// @access  Private/Lecturer
const getMyCourses = asyncHandler(async (req, res) => {
  // Find courses where the lecturer field matches the logged-in user's ID
  const courses = await Course.find({ lecturer: req.user._id });
  res.json(courses);
});


// Make sure to export all functions
export {  
  createCourse,
  addLectureToCourse,
  getCourses,
  getCourseById,
  getMyCourses,
};