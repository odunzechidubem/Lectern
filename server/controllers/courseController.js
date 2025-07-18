import asyncHandler from 'express-async-handler';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

// GET all courses with manual population
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({});
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

// GET a single course by ID with manual population
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('assignments');
  if (course) {
    const lecturer = await User.findById(course.lecturer).select('name email');
    const students = await User.find({ '_id': { $in: course.students } }).select('name email');
    const courseObject = course.toObject();
    courseObject.lecturer = lecturer;
    courseObject.students = students;
    res.json(courseObject);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// GET a lecturer's own courses
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ lecturer: req.user._id });
  res.json(courses);
});

// POST a new course
const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) { res.status(400); throw new Error('Please provide a title and description'); }
  const courseExists = await Course.findOne({ title, lecturer: req.user._id });
  if (courseExists) { res.status(400); throw new Error('You have already created a course with this title'); }
  const course = new Course({ title, description, lecturer: req.user._id });
  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

// PUT (update) a course
const updateCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('User not authorized to update this course'); }
    course.title = title || course.title;
    course.description = description || course.description;
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

// DELETE a course
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('User not authorized to delete this course'); }
  await course.deleteOne();
  res.status(200).json({ message: 'Course deleted successfully' });
});

// POST a new lecture to a course
const addLectureToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, notesUrl } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('User not authorized'); }
  const newLecture = { title, videoUrl, notesUrl };
  course.lectures.push(newLecture);
  await course.save();
  res.status(201).json(course);
});

// DELETE a lecture from a course
const deleteLectureFromCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('User not authorized'); }
  course.lectures = course.lectures.filter(lec => lec._id.toString() !== req.params.lectureId);
  await course.save();
  res.status(200).json({ message: 'Lecture deleted' });
});

// POST to enroll a student in a course
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.students.find(s => s._id.toString() === req.user._id.toString())) { res.status(400); throw new Error('Already enrolled'); }
  course.students.push(req.user._id);
  await course.save();
  res.status(200).json({ message: 'Enrolled successfully' });
});

export { createCourse, addLectureToCourse, getCourses, getCourseById, getMyCourses, updateCourse, enrollInCourse, deleteLectureFromCourse, deleteCourse };